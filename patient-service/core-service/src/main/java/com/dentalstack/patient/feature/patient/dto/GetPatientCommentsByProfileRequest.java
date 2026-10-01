package com.dentalstack.patient.feature.patient.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetPatientCommentsByProfileRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Profile ID is required")
    private Long profileId;
}
