package com.dentalstack.patient.feature.storage.files.dto;

import com.dentalstack.patient.global.dto.UserId;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateFolderRequest {
    @NotNull
    @Builder.Default
    private String parentPath = "/";

    @NotNull
    private String folderName;

    @NotNull
    private UserId uploader;

    @Builder.Default
    private Set<UserId> owners = new HashSet<>();

    @Nullable
    private Boolean isDefaultFolder;

    @Nullable
    private Boolean isPatientFolder;

    @Nullable
    private Boolean isPurchaseOrderFile;
}
