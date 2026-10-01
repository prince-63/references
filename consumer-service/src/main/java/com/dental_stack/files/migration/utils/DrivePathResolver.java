package com.dental_stack.files.migration.utils;

import com.dental_stack.files.common.repository.FileRepository;
import com.dental_stack.files.migration.dto.PathNode;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@AllArgsConstructor
public class DrivePathResolver {
    private static final long CACHE_TTL_MINUTES = 15;
    private static final int MAX_CACHE_ENTRIES_PER_PROFILE = 1000;

    private final FileRepository fileRepository;

    private final Map<Long, Map<String, CachedPathNode>> pathCache = new ConcurrentHashMap<>();
    private final Map<String, Object> folderCreationLocks = new ConcurrentHashMap<>();

    private static class CachedPathNode {
        private final PathNode pathNode;
        private final long timestamp;

        CachedPathNode(PathNode pathNode) {
            this.pathNode = pathNode;
            this.timestamp = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - timestamp
                    > TimeUnit.MINUTES.toMillis(CACHE_TTL_MINUTES);
        }

        PathNode getPathNode() {
            return pathNode;
        }
    }

    private String findFileByNameAndParent(
            Drive drive, String name, String parentId, boolean isFolder) throws Exception {
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

        FileList result =
                drive.files()
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
            FileList result =
                    drive.files()
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

        File folder = drive.files().create(folderMetadata).setFields("id, name, parents").execute();

        return folder.getId();
    }

    public String getParentFolderIdOptimized(Drive drive, Long profileId, String fullPath)
            throws Exception {
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

    public String resolvePath(
            Drive drive,
            Long profileId,
            String fullPath,
            boolean isFolder,
            boolean createIfNotExists)
            throws Exception {
        return resolvePathOptimized(drive, profileId, fullPath, isFolder, createIfNotExists);
        /*
        ExistingPath existing = resolveNearestPath(fullPath);

        if (existing == null || existing.isRoot() || existing.getDriveFileId() == null) {
            return resolvePathOptimized(drive, profileId, fullPath, isFolder, createIfNotExists);
        }

        return resolvePathOptimized(
                drive, profileId, fullPath, isFolder, createIfNotExists, existing.getPath(), existing.getDriveFileId());
         */
    }

    public String resolvePathOptimized(
            Drive drive,
            Long profileId,
            String fullPath,
            boolean isFolder,
            boolean createIfNotExists)
            throws Exception {
        return resolvePathOptimized(
                drive, profileId, fullPath, isFolder, createIfNotExists, "", null);
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

        String remainingPath =
                startPath == null || startPath.isEmpty()
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

            Map<String, String> childFolders = listChildFolders(drive, parentId);
            String existingId = childFolders.get(segment);

            if (existingId != null) {
                cacheNode(profileId, currentPath, existingId, segment, parentId, shouldBeFolder);
                parentId = existingId;
            } else if (createIfNotExists && shouldBeFolder) {
                parentId =
                        createFolderWithFineLock(drive, profileId, segment, parentId, currentPath);
            } else {
                return null;
            }
        }

        return parentId;
    }

    /*
    public ExistingPath resolveNearestPath(String fullPath) {
        List<String> parentPaths = generateParentPaths(fullPath);

        List<File> matches =
                fileRepository.findNearestExistingFolder(parentPaths);

        if (matches.isEmpty()) {
            return ExistingPath.root();
        }

        File nearest = matches.get(0);
        return ExistingPath.builder()
                .path(nearest.getFullPath())
                .driveFileId(nearest.getDriveFileId())
                .build();
    }
     */

    private List<String> generateParentPaths(String fullPath) {
        List<String> paths = new ArrayList<>();
        String[] segments = fullPath.split("/");

        String current = "";
        for (String segment : segments) {
            current = current.isEmpty() ? segment : current + "/" + segment;
            paths.add(current);
        }

        Collections.reverse(paths); // longest first
        return paths;
    }

    private String resolvePathWithRetry(
            Drive drive,
            Long profileId,
            String fullPath,
            boolean isFolder,
            boolean createIfNotExists,
            int retryCount)
            throws Exception {
        try {
            return resolvePathOptimized(drive, profileId, fullPath, isFolder, createIfNotExists);
        } catch (Exception e) {
            if (retryCount > 0 && e.getMessage() != null && e.getMessage().contains("404")) {
                log.warn(
                        "Path resolution failed (possibly stale cache), clearing cache and retrying: {}",
                        fullPath);
                clearPathAndAncestors(profileId, fullPath);
                return resolvePathOptimized(
                        drive, profileId, fullPath, isFolder, createIfNotExists);
            }
            throw e;
        }
    }

    private String createFolderWithFineLock(
            Drive drive, Long profileId, String folderName, String parentId, String currentPath)
            throws Exception {

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
            Long profileId,
            String path,
            String fileId,
            String fileName,
            String parentFileId,
            boolean isFolder) {
        Map<String, CachedPathNode> profileCache =
                pathCache.computeIfAbsent(profileId, k -> new ConcurrentHashMap<>());

        if (profileCache.size() >= MAX_CACHE_ENTRIES_PER_PROFILE) {
            evictOldestEntries(profileCache);
        }

        PathNode pathNode =
                PathNode.builder()
                        .path(path)
                        .fileId(fileId)
                        .fileName(fileName)
                        .parentFileId(parentFileId)
                        .isFolder(isFolder)
                        .profileId(profileId)
                        .build();

        profileCache.put(path, new CachedPathNode(pathNode));
    }

    private void evictOldestEntries(Map<String, CachedPathNode> profileCache) {
        List<Map.Entry<String, CachedPathNode>> entries = new ArrayList<>(profileCache.entrySet());
        entries.sort(
                Map.Entry.comparingByValue((c1, c2) -> Long.compare(c1.timestamp, c2.timestamp)));

        int toRemove = profileCache.size() / 10;
        for (int i = 0; i < toRemove && i < entries.size(); i++) {
            profileCache.remove(entries.get(i).getKey());
        }

        log.debug("Evicted {} old cache entries (LRU)", toRemove);
    }

    private PathNode getCachedNode(Long profileId, String path) {
        Map<String, CachedPathNode> userCache = pathCache.get(profileId);
        if (userCache != null) {
            CachedPathNode cached = userCache.get(path);
            if (cached != null) {
                if (cached.isExpired()) {
                    userCache.remove(path);
                    log.debug("Cache entry expired (TTL): {}", path);
                    return null;
                }
                return cached.getPathNode();
            }
        }
        return null;
    }

    private void removeCachedNode(Long profileId, String path) {
        Map<String, CachedPathNode> userCache = pathCache.get(profileId);
        if (userCache != null) {
            userCache.remove(path);
        }
    }

    private void clearPathAndAncestors(Long profileId, String fullPath) {
        if (fullPath == null || fullPath.isEmpty()) {
            return;
        }

        fullPath = normalizePath(fullPath);
        Map<String, CachedPathNode> userCache = pathCache.get(profileId);
        if (userCache == null) {
            return;
        }

        userCache.remove(fullPath);

        String[] segments = fullPath.split("/");
        String currentPath = "";
        for (String segment : segments) {
            currentPath = currentPath.isEmpty() ? segment : currentPath + "/" + segment;
            userCache.remove(currentPath);
        }

        log.debug("Cleared cache for path and ancestors: {}", fullPath);
    }

    public void clearCache(Long profileId) {
        Map<String, CachedPathNode> removed = pathCache.remove(profileId);
        if (removed != null) {
            log.info("Cleared {} cached paths for profileId: {}", removed.size(), profileId);
        }
    }

    public void clearAllCache() {
        int totalPaths = pathCache.values().stream().mapToInt(Map::size).sum();
        pathCache.clear();
        folderCreationLocks.clear();
        log.info(
                "Cleared entire path cache ({} paths across {} profiles)",
                totalPaths,
                pathCache.size());
    }

    public void cleanupExpiredCache() {
        int totalExpired = 0;
        for (Map.Entry<Long, Map<String, CachedPathNode>> profileEntry : pathCache.entrySet()) {
            Map<String, CachedPathNode> profileCache = profileEntry.getValue();
            List<String> expiredKeys = new ArrayList<>();

            for (Map.Entry<String, CachedPathNode> entry : profileCache.entrySet()) {
                if (entry.getValue().isExpired()) {
                    expiredKeys.add(entry.getKey());
                }
            }

            for (String key : expiredKeys) {
                profileCache.remove(key);
            }

            totalExpired += expiredKeys.size();
        }

        if (totalExpired > 0) {
            log.info("Cleaned up {} expired cache entries", totalExpired);
        }
    }

    public List<File> listFilesRecursively(Drive drive, String folderId) throws Exception {
        List<File> allFiles = new ArrayList<>();
        listFilesRecursivelyHelper(drive, folderId, allFiles);
        return allFiles;
    }

    private void listFilesRecursivelyHelper(Drive drive, String folderId, List<File> allFiles)
            throws Exception {
        String pageToken = null;

        do {
            String query = "'" + folderId + "' in parents and trashed=false";

            FileList result =
                    drive.files()
                            .list()
                            .setQ(query)
                            .setFields(
                                    "nextPageToken, files(id, name, mimeType, size, webViewLink, webContentLink, parents)")
                            .setPageSize(100)
                            .setPageToken(pageToken)
                            .execute();

            List<File> files = result.getFiles();
            if (files != null) {
                for (File file : files) {
                    allFiles.add(file);

                    if ("application/vnd.google-apps.folder".equals(file.getMimeType())) {
                        listFilesRecursivelyHelper(drive, file.getId(), allFiles);
                    }
                }
            }

            pageToken = result.getNextPageToken();
        } while (pageToken != null);
    }
}
