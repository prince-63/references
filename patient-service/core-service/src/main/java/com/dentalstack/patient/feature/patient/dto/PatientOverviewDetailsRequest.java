package com.dentalstack.patient.feature.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientOverviewDetailsRequest {
    private Long profileId;
    private Long customerProfileId;
    private Long invitorOrganizationId;
    private Long doctorId;
    private Long patientId;
    private Long patientTaskTrackerId;
}
