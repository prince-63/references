package com.dentalstack.patient.feature.storage.files.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RenameFileRequest {
    private long fileId;

    @NotNull
    private String newName;
}
