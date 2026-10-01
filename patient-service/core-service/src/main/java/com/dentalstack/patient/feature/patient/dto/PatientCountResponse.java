package com.dentalstack.patient.feature.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientCountResponse {
    private Integer allPatients;
    private Integer inAssessment;
    private Integer inPlanning;
    private Integer inManufacturing;
    private Integer transit;
    private Integer startingSoon;
    private Integer ongoing;
    private Integer completed;
    private Integer paused;
    private Integer refinement;
    private Integer practicePatientCount;
    private Integer customerPatientCount;
    private Integer newCasesThisMonthCount;
    private Integer combinedTreatmentTrackingCount;
}
