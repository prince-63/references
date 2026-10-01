package com.dentalstack.patient.feature.storage.files.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GetFolderSizeRequest {
    private Long profileId;
    private Long doctorId;
    private String path;
}
