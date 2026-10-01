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
public class UpdatePatientNotesRequest {
    @NotBlank(message = "Notes cannot be empty")
    private String notes;

    private Long userProfileId;
    private Long noteId;
    private Long patientId;
}
