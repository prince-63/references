package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoveTaskTrackerRequest {
    private Long profileId;
    private Long organizationId;
    private Long taskId;
    private Long doctorId;
    private Long workflowStatusId;
    private Long patientId;
    private Long workflowId;
    private Integer position;
    private Boolean isVspTaskMoving;
}
