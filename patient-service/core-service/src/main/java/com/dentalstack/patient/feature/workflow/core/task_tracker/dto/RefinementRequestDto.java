package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import lombok.Data;

@Data
public class RefinementRequestDto {
    private Long profileId;
    private Long patientId;
    private Long receiverProfileId;
    private Long practiceProfileId;
}
