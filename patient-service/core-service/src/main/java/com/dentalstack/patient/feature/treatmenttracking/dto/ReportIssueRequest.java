package com.dentalstack.patient.feature.treatmenttracking.dto;

import lombok.Data;

@Data
public class ReportIssueRequest {
    private Long treatmentPlanId;
    private Integer alignerNumber;
}
