package com.dentalstack.patient.feature.rewards.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompleteTaskRequest {
    private String notes;
    private Long patientId;
    private Long taskId;
}
