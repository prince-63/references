package com.dentalstack.patient.feature.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientCountDTO {
    private int allPatient;
    private int inPlanning;
    private int inAssessment;
    private int trackingPending;
    private int startingSoon;
    private int ongoing;
    private int completed;
    private int paused;
    private int inRefinement;
}
