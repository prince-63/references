package com.dentalstack.patient.feature.treatmenttracking.dto;

import lombok.Data;

@Data
public class CheckInRequest {
    private Long treatmentPlanId;
    private Integer alignerNumber;
}
