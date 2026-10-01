package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.enums.FileType;
import com.dentalstack.patient.feature.storage.files.enums.Status;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileResponse {

    private Long id;
    private String name;
    private String url;
    private Long uploaderUserId;
    private UserType uploaderUserType;
    private Long deletedBy;
    private UserType deletedByUserType;
    private ZonedDateTime deletedAt;
    private boolean folder;
    private FileType type;
    private Status status;
    private String extension;
    private String fullPath;
    private Long size;
    private Long parentFileId;
    private boolean isDefaultFolder;
    private boolean isPatientFolder;
    private boolean isFilesFromTreatmentPlan;
    private Long ownerUserId;
    private UserType ownerUserType;
    private boolean isFileDisplayToPatient;
    private Long userProfileId;
    private Long organizationId;
    private Long cloneFromFileId;
    private Boolean isPurchaseOrderFile;
    private List<Long> childrenFileIds;

    public static FileResponse from(File file) {
        if (file == null) return null;

        return FileResponse.builder()
                .id(file.getId())
                .name(file.getName() != null ? file.getName() : "")
                .url(file.getUrl() != null ? file.getUrl() : "")
                .uploaderUserId(file.getUploaderUserId())
                .uploaderUserType(file.getUploaderUserType())
                .deletedBy(file.getDeletedBy())
                .deletedByUserType(file.getDeletedByUserType())
                .deletedAt(file.getDeletedAt())
                .folder(file.isFolder())
                .type(file.getType() != null ? file.getType() : null)
                .status(file.getStatus() != null ? file.getStatus() : Status.ACTIVE)
                .extension(file.getExtension() != null ? file.getExtension() : "")
                .fullPath(file.getFullPath() != null ? file.getFullPath() : "")
                .size(file.getSize())
                .parentFileId(
                        file.getParentFile() != null ? file.getParentFile().getId() : null)
                .isDefaultFolder(file.isDefaultFolder())
                .isPatientFolder(file.isPatientFolder())
                .isFilesFromTreatmentPlan(file.isFilesFromTreatmentPlan())
                .ownerUserId(file.getOwnerUserId())
                .ownerUserType(file.getOwnerUserType())
                .isFileDisplayToPatient(file.isFileDisplayToPatient())
                .userProfileId(
                        file.getUserProfile() != null ? file.getUserProfile().getId() : null)
                .organizationId(
                        file.getOrganization() != null ? file.getOrganization().getId() : null)
                .cloneFromFileId(file.getCloneFromFileId())
                .isPurchaseOrderFile(file.getIsPurchaseOrderFile() != null ? file.getIsPurchaseOrderFile() : false)
                .childrenFileIds(
                        file.getChildrenFiles() != null
                                ? file.getChildrenFiles().stream()
                                        .map(child -> child != null ? child.getId() : null)
                                        .collect(Collectors.toList())
                                : Collections.emptyList())
                .build();
    }
}
