package com.dentalstack.patient.feature.storage.migration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MigrationStatus {
    private Long profileId;
    private Long totalFiles;
    private Long migratedFiles;
    private Long remainingFiles;
    private Long deletedFiles;
    private String status;
}
