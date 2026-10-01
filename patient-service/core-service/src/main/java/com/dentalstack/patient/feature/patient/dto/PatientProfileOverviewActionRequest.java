package com.dentalstack.patient.feature.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientProfileOverviewActionRequest {
    private Long profileId;
    private Long organizationId;
    private Long doctorId;
    private Filter filter;
    private Long patientId;
    private Long treatmentPlanId;

    public enum Filter {
        ALL_ALIGNERS,
        CURRENT_ALIGNER,
        PENDING_UPDATES,
        ISSUES_REPORTED,
        ALIGNER_CHECKINS,
        ALIGNER_CHANGES
    }
}
