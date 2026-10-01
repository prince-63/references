package com.dentalstack.patient.feature.storage.drive.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FolderSizeResponse {
    private String path;
    private double sizeInMB;
    private double sizeInGB;
}
