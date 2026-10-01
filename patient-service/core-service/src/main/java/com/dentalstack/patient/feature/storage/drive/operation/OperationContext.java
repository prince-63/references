package com.dentalstack.patient.feature.storage.drive.operation;

import java.util.List;
import lombok.Builder;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

public class OperationContext {

    @Data
    @Builder
    public static class UploadContext {
        private Long profileId;
        private String path;
        private MultipartFile file;
    }

    @Data
    @Builder
    public static class UploadedChunkContext {
        private String fileName;
        private String driveFileId;
        private String url;
        private Long size;
        private String thumbnailUrl;
        private String downloadUrl;
    }

    @Data
    @Builder
    public static class DeleteContext {
        private Long profileId;
        private String path;
    }

    @Data
    @Builder
    public static class DownloadContext {
        private Long profileId;
        private String path;
        private String driveFileId;
    }

    @Data
    @Builder
    public static class CopyContext {
        private Long profileId;
        private String sourcePath;
        private String destinationPath;
    }

    @Data
    @Builder
    public static class MoveContext {
        private Long profileId;
        private String sourcePath;
        private String destinationPath;
    }

    @Data
    @Builder
    public static class FolderContext {
        private Long profileId;
        private String path;
    }

    @Data
    @Builder
    public static class RenameFolderContext {
        private Long profileId;
        private String path;
        private String newName;
    }

    @Data
    @Builder
    public static class DownloadFolderContext {
        private Long profileId;
        private String path;
        public String zipName;
        public String driveFileId;
    }

    @Data
    @Builder
    public static class ShareContext {
        private Long profileId;
        private String path;
        private List<String> emails;
        private String role;
        private String driveFileId;
    }

    @Data
    @Builder
    public static class UnShareContext {
        private Long profileId;
        private String path;
        private List<String> emails;
        private String driveFileId;
    }
}
