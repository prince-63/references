package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowStatusUpdateRequestDto {

    @NotNull(message = "New workflow status ID is required")
    private Long newWorkflowStatusId;

    private String comments;
    private LocalDateTime transitionDate;
}
