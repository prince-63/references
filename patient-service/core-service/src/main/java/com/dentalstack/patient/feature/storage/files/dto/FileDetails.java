package com.dentalstack.patient.feature.storage.files.dto;

import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.enums.FileType;
import com.dentalstack.patient.feature.storage.files.enums.Status;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.Nullable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FileDetails implements Serializable {
    private static final long serialVersionUID = 1L;

    private long fileId;
    private String driveFileId;

    @NotNull
    private String name;

    private String url;
    private String thumbnailUrl;
    private String downloadUrl;
    private String fullPath;
    private long createdBy;
    private UserType createdByUserType;

    @Nullable
    private Long deletedBy;

    private UserType deletedByUserType;
    private boolean folder = false;
    private FileType type;
    private String extension;
    private int childFileCount = 0;
    private int childFolderCount = 0;
    private Set<FileDetails> childrenFiles;
    private long size;
    private ZonedDateTime createdAt;
    private boolean isDefaultFolder;
    private boolean isPatientFolder;
    private boolean isFilesFromTreatmentPlan;
    private boolean isFileDisplayToPatient;
    private Boolean isClonedFile;
    private Boolean isPurchaseOrderFiles;
    private Boolean isGDrivePlatform;
    private Long userProfileId;

    public static FileDetails from(File file) {
        int childFileCount = 0;
        int childFolderCount = 0;
        var childFiles = new TreeSet<FileDetails>((f1, f2) -> {
            if (f1.isFolder() == f2.isFolder()) {
                return f1.getName().compareTo(f2.getName());
            }
            return Boolean.compare(f2.isFolder(), f1.isFolder());
        });

        Set<Long> addedFileIds = new HashSet<>();

        for (var childFile : file.getChildrenFiles()) {
            if (!childFile.getStatus().equals(Status.ACTIVE)) continue;

            if (addedFileIds.contains(childFile.getId())) continue;

            addedFileIds.add(childFile.getId());

            if (childFile.isFolder()) {
                childFolderCount += 1;
            } else {
                childFileCount += 1;
            }

            childFiles.add(FileDetails.from(childFile));
        }
        Boolean isPurchaseOrderFile = file.getIsPurchaseOrderFile() != null
                ? file.getIsPurchaseOrderFile()
                : file.getCloneFromFileId() != null;

        return new FileDetails(
                file.getId(),
                file.getDriveFileId(),
                file.getName(),
                file.getUrl(),
                file.getThumbnailUrl(),
                file.getDownloadUrl(),
                file.getFullPath(),
                file.getUploaderUserId(),
                file.getUploaderUserType(),
                file.getDeletedBy(),
                file.getDeletedByUserType(),
                file.isFolder(),
                file.getType(),
                file.getExtension(),
                childFileCount,
                childFolderCount,
                childFiles,
                file.size(),
                file.getCreatedAt(),
                file.isDefaultFolder(),
                file.isPatientFolder(),
                file.isFilesFromTreatmentPlan(),
                file.isFileDisplayToPatient(),
                file.getCloneFromFileId() != null,
                isPurchaseOrderFile,
                file.getIsGDrivePlatform(),
                file.getUserProfile().getId());
    }
}
