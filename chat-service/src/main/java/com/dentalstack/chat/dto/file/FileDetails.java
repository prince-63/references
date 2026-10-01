package com.dentalstack.chat.dto.file;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.Nullable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FileDetails {

    private long fileId;

    @NotNull
    private String name;

    private String url;
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
}
