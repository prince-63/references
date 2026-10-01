package com.dentalstack.patient.feature.treatmenttracking.dto;

import lombok.Data;

@Data
public class MoveAlignerRequest {
    private Long treatmentPlanId;
    private Integer toAlignerNumber;
}
