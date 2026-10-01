package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndividualPatientTaskRequest {
    private Long patientId;
    private Long profileId;
    private Long organizationId;
    private String query;
    private Long doctorId;
    private String workflowName;
}
