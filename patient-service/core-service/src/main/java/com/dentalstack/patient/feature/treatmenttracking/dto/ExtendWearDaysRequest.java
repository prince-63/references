package com.dentalstack.patient.feature.treatmenttracking.dto;

import lombok.Data;

@Data
public class ExtendWearDaysRequest {
    private Long treatmentPlanId;
    private Integer alignerNumber;
    private Integer extraDays;
}
