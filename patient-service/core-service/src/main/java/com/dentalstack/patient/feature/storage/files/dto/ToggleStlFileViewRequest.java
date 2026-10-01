package com.dentalstack.patient.feature.storage.files.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ToggleStlFileViewRequest {
    private Long profileId;
    private Long patientId;
}
