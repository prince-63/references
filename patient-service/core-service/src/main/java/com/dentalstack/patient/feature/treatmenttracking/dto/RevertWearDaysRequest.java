package com.dentalstack.patient.feature.treatmenttracking.dto;

import lombok.Data;

@Data
public class RevertWearDaysRequest {
    private Long treatmentPlanId;
    private Integer alignerNumber;
}
