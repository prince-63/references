package com.dentalstack.patient.feature.storage.drive.optimize;

import com.dentalstack.patient.feature.storage.drive.dto.PathNode;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@AllArgsConstructor
public class OptimizedDrivePathResolver {
    private static final long CACHE_TTL_MINUTES = 15;
    private static final int MAX_CACHE_ENTRIES_PER_PROFILE = 1000;
    private static final String REDIS_PATH_CACHE_PREFIX = "drive:path:cache:";

    private final FileRepository fileRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private final Map<String, Object> folderCreationLocks = new ConcurrentHashMap<>();

    private String getRedisKey(Long profileId) {
        return REDIS_PATH_CACHE_PREFIX + profileId;
    }

    private String findFileByNameAndParent(Drive drive, String name, String parentId, boolean isFolder)
            throws Exception {
        StringBuilder query = new StringBuilder();
        query.append("name='").append(name.replace("'", "\\'")).append("'");
        query.append(" and trashed=false");

        if (parentId != null) {
            query.append(" and '").append(parentId).append("' in parents");
        } else {
            query.append(" and 'root' in parents");
        }

        if (isFolder) {
            query.append(" and mimeType='application/vnd.google-apps.folder'");
        }

        FileList result = drive.files()
                .list()
                .setQ(query.toString())
                .setFields("files(id, name, mimeType, parents)")
                .setPageSize(1)
                .execute();

        List<File> files = result.getFiles();
        if (files != null && !files.isEmpty()) {
            return files.get(0).getId();
        }

        return null;
    }

    private Map<String, String> listChildFolders(Drive drive, String parentId) throws Exception {
        Map<String, String> childFolders = new HashMap<>();

        StringBuilder query = new StringBuilder();
        query.append("trashed=false");
        query.append(" and mimeType='application/vnd.google-apps.folder'");

        if (parentId != null) {
            query.append(" and '").append(parentId).append("' in parents");
        } else {
            query.append(" and 'root' in parents");
        }

        String pageToken = null;
        do {
            FileList result = drive.files()
                    .list()
                    .setQ(query.toString())
                    .setFields("nextPageToken, files(id, name)")
                    .setPageSize(100)
                    .setPageToken(pageToken)
                    .execute();

            List<File> files = result.getFiles();
            if (files != null) {
                for (File file : files) {
                    childFolders.put(file.getName(), file.getId());
                }
            }

            pageToken = result.getNextPageToken();
        } while (pageToken != null);

        log.debug("Prefetched {} child folders for parent: {}", childFolders.size(), parentId);
        return childFolders;
    }

    private String createFolder(Drive drive, String folderName, String parentId) throws Exception {
        File folderMetadata = new File();
        folderMetadata.setName(folderName);
        folderMetadata.setMimeType("application/vnd.google-apps.folder");

        if (parentId != null) {
            folderMetadata.setParents(Collections.singletonList(parentId));
        }

        File folder = drive.files()
                .create(folderMetadata)
                .setFields("id, name, parents")
                .execute();

        return folder.getId();
    }

    public String getParentFolderIdOptimized(Drive drive, Long profileId, String fullPath) throws Exception {
        if (fullPath == null || fullPath.trim().isEmpty()) {
            return null;
        }

        fullPath = normalizePath(fullPath);
        int lastSlash = fullPath.lastIndexOf('/');

        if (lastSlash == -1) {
            return null;
        }

        String parentPath = fullPath.substring(0, lastSlash);
        return resolvePath(drive, profileId, parentPath, true, true);
    }

    public String resolvePath(Drive drive, Long profileId, String fullPath, boolean isFolder, boolean createIfNotExists)
            throws Exception {
        ExistingPath existing = resolveNearestPath(fullPath);

        if (existing == null || existing.isRoot() || existing.getDriveFileId() == null) {
            return resolvePathOptimized(drive, profileId, fullPath, isFolder, createIfNotExists);
        }

        return resolvePathOptimized(
                drive, profileId, fullPath, isFolder, createIfNotExists, existing.getPath(), existing.getDriveFileId());
    }

    public String resolvePathOptimized(
            Drive drive, Long profileId, String fullPath, boolean isFolder, boolean createIfNotExists)
            throws Exception {
        return resolvePathOptimized(drive, profileId, fullPath, isFolder, createIfNotExists, "", null);
    }

    private String resolvePathOptimized(
            Drive drive,
            Long profileId,
            String fullPath,
            boolean isFolder,
            boolean createIfNotExists,
            String startPath,
            String startParentId)
            throws Exception {
        fullPath = normalizePath(fullPath);

        String remainingPath = startPath == null || startPath.isEmpty()
                ? fullPath
                : fullPath.substring(startPath.length()).replaceFirst("^/", "");

        if (remainingPath.isEmpty()) {
            return startParentId;
        }

        String[] pathSegments = remainingPath.split("/");
        String currentPath = startPath == null ? "" : startPath;
        String parentId = startParentId;

        for (int i = 0; i < pathSegments.length; i++) {
            String segment = pathSegments[i];
            currentPath = currentPath.isEmpty() ? segment : currentPath + "/" + segment;

            boolean isLast = (i == pathSegments.length - 1);
            boolean shouldBeFolder = !isLast || isFolder;

            PathNode cached = getCachedNode(profileId, currentPath);
            if (cached != null) {
                parentId = cached.getFileId();
                continue;
            }

            // Check cache size before adding new entries
            String redisKey = getRedisKey(profileId);
            Long cacheSize = redisTemplate.opsForHash().size(redisKey);
            if (cacheSize >= MAX_CACHE_ENTRIES_PER_PROFILE) {
                evictOldestEntries(profileId);
            }

            Map<String, String> childFolders = listChildFolders(drive, parentId);
            String existingId = childFolders.get(segment);

            if (existingId != null) {
                cacheNode(profileId, currentPath, existingId, segment, parentId, shouldBeFolder);
                parentId = existingId;
            } else if (createIfNotExists && shouldBeFolder) {
                parentId = createFolderWithFineLock(drive, profileId, segment, parentId, currentPath);
            } else {
                return null;
            }
        }

        return parentId;
    }

    public ExistingPath resolveNearestPath(String fullPath) {
        List<String> parentPaths = generateParentPaths(fullPath);

        List<com.dentalstack.patient.feature.storage.files.entity.File> matches =
                fileRepository.findNearestExistingFolder(parentPaths);

        if (matches.isEmpty()) {
            return ExistingPath.root();
        }

        com.dentalstack.patient.feature.storage.files.entity.File nearest = matches.get(0);
        return ExistingPath.builder()
                .path(nearest.getFullPath())
                .driveFileId(nearest.getDriveFileId())
                .build();
    }

    private List<String> generateParentPaths(String fullPath) {
        List<String> paths = new ArrayList<>();
        String[] segments = fullPath.split("/");

        String current = "";
        for (String segment : segments) {
            current = current.isEmpty() ? segment : current + "/" + segment;
            paths.add(current);
        }

        Collections.reverse(paths);
        return paths;
    }

    private String createFolderWithFineLock(
            Drive drive, Long profileId, String folderName, String parentId, String currentPath) throws Exception {

        String lockKey = profileId + ":" + currentPath;
        Object lock = folderCreationLocks.computeIfAbsent(lockKey, k -> new Object());

        synchronized (lock) {
            try {
                String existingFileId = findFileByNameAndParent(drive, folderName, parentId, true);
                if (existingFileId != null) {
                    log.debug("Folder already exists (created by another thread): {}", currentPath);
                    cacheNode(profileId, currentPath, existingFileId, folderName, parentId, true);
                    return existingFileId;
                }

                log.info("Creating folder: {} under parent: {}", folderName, parentId);
                String newFolderId = createFolder(drive, folderName, parentId);
                cacheNode(profileId, currentPath, newFolderId, folderName, parentId, true);

                return newFolderId;
            } finally {
                folderCreationLocks.remove(lockKey);
            }
        }
    }

    public String getFileNameFromPath(String fullPath) {
        if (fullPath == null || fullPath.trim().isEmpty()) {
            return "";
        }

        fullPath = normalizePath(fullPath);
        int lastSlash = fullPath.lastIndexOf('/');

        if (lastSlash == -1) {
            return fullPath;
        }

        return fullPath.substring(lastSlash + 1);
    }

    private String normalizePath(String path) {
        if (path == null) {
            return "";
        }

        path = path.trim();

        while (path.startsWith("/")) {
            path = path.substring(1);
        }

        while (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }

        path = path.replaceAll("/+", "/");

        return path;
    }

    private void cacheNode(
            Long profileId, String path, String fileId, String fileName, String parentFileId, boolean isFolder) {
        String redisKey = getRedisKey(profileId);

        PathNode pathNode = PathNode.builder()
                .path(path)
                .fileId(fileId)
                .fileName(fileName)
                .parentFileId(parentFileId)
                .isFolder(isFolder)
                .profileId(profileId)
                .build();

        redisTemplate.opsForHash().put(redisKey, path, pathNode);
        redisTemplate.expire(redisKey, CACHE_TTL_MINUTES, TimeUnit.MINUTES);

        log.debug("Cached path node: {} in Redis", path);
    }

    private void evictOldestEntries(Long profileId) {
        String redisKey = getRedisKey(profileId);
        long size = redisTemplate.opsForHash().size(redisKey);

        if (size >= MAX_CACHE_ENTRIES_PER_PROFILE) {
            // Get all entries
            Map<Object, Object> entries = redisTemplate.opsForHash().entries(redisKey);

            // Remove 10% of entries (simple FIFO from Redis perspective)
            int toRemove = (int) (size / 10);
            int removed = 0;

            for (Object key : entries.keySet()) {
                if (removed >= toRemove) break;
                redisTemplate.opsForHash().delete(redisKey, key);
                removed++;
            }

            log.debug("Evicted {} cache entries from Redis for profileId: {}", removed, profileId);
        }
    }

    private PathNode getCachedNode(Long profileId, String path) {
        String redisKey = getRedisKey(profileId);
        Object cachedObj = redisTemplate.opsForHash().get(redisKey, path);

        if (cachedObj instanceof PathNode) {
            return (PathNode) cachedObj;
        }

        return null;
    }
}
