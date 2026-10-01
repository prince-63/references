package com.dentalstack.patient.feature.storage.drive.util;

import com.dentalstack.patient.feature.storage.drive.dto.PathNode;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DrivePathResolver {

    private static final String REDIS_CACHE_PREFIX = "drive:path:cache:";
    private static final long CACHE_TTL_MINUTES = 30;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private String getRedisKey(Long profileId) {
        return REDIS_CACHE_PREFIX + profileId;
    }

    public String resolvePath(Drive drive, Long profileId, String fullPath, boolean isFolder, boolean createIfNotExists)
            throws Exception {
        if (fullPath == null || fullPath.trim().isEmpty()) {
            return null;
        }

        fullPath = normalizePath(fullPath);

        PathNode cachedNode = getCachedNode(profileId, fullPath);
        if (cachedNode != null) {
            try {
                drive.files().get(cachedNode.getFileId()).setFields("id").execute();
                return cachedNode.getFileId();
            } catch (Exception e) {
                log.warn("Cached file no longer exists: {}, removing from cache", fullPath);
                removeCachedNode(profileId, fullPath);
            }
        }

        String[] pathSegments = fullPath.split("/");
        String currentPath = "";
        String parentId = null;

        for (int i = 0; i < pathSegments.length; i++) {
            String segment = pathSegments[i];
            currentPath = currentPath.isEmpty() ? segment : currentPath + "/" + segment;

            boolean isLastSegment = (i == pathSegments.length - 1);
            boolean shouldBeFolder = !isLastSegment || isFolder;

            PathNode segmentNode = getCachedNode(profileId, currentPath);
            if (segmentNode != null) {
                try {
                    drive.files().get(segmentNode.getFileId()).setFields("id").execute();
                    parentId = segmentNode.getFileId();
                    continue;
                } catch (Exception e) {
                    log.warn("Cached file no longer exists: {}, removing from cache", currentPath);
                    removeCachedNode(profileId, currentPath);
                }
            }

            String existingFileId = findFileByNameAndParent(drive, segment, parentId, shouldBeFolder);

            if (existingFileId != null) {
                cacheNode(profileId, currentPath, existingFileId, segment, parentId, shouldBeFolder);
                parentId = existingFileId;
            } else if (createIfNotExists && shouldBeFolder) {
                log.info("Creating folder: {} under parent: {}", segment, parentId);
                String newFolderId = createFolder(drive, segment, parentId);
                cacheNode(profileId, currentPath, newFolderId, segment, parentId, true);
                parentId = newFolderId;
            } else if (!isLastSegment) {
                throw new IllegalStateException("Path segment does not exist: " + currentPath);
            } else {
                return null;
            }
        }

        return parentId;
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

    private PathNode getCachedNode(Long profileId, String path) {
        String redisKey = getRedisKey(profileId);
        Object cachedObj = redisTemplate.opsForHash().get(redisKey, path);

        if (cachedObj instanceof PathNode) {
            return (PathNode) cachedObj;
        }

        return null;
    }

    private void removeCachedNode(Long profileId, String path) {
        String redisKey = getRedisKey(profileId);
        redisTemplate.opsForHash().delete(redisKey, path);
    }
}
