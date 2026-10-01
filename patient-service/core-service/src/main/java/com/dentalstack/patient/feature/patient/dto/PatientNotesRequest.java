package com.dentalstack.patient.feature.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientNotesRequest {
    @NotBlank(message = "Notes cannot be empty")
    private String notes;

    private Long profileId;
    private Long patientId;
}
