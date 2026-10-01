package com.dentalstack.patient.feature.workflow.pre_treatment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientPreTreatmentRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Added by profile ID is required")
    private Long addedByProfileId;

    private Long caseRecordId;

    private Long prescriptionId;

    private Boolean isActive;
}
