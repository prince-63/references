package com.dentalstack.chat.dto.file;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.ZonedDateTime;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FileDetailsV2 {
    private long fileId;
    private String driveFileId;
    private String name;
    private String url;
    private String thumbnailUrl;
    private String downloadUrl;
    private String fullPath;
    private long createdBy;
    private UserType createdByUserType;
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
}
