package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import jakarta.annotation.Nullable;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoveMultiTaskTrackerRequest {
    private Long profileId;
    private Long organizationId;
    private List<TaskInfo> taskInfo;
    private Long doctorId;
    private Long workflowStatusId;
    private Long workflowId;
    private Long assigneeId;
    private LocalDateTime estimatedCompletionDate;
    private Long parentTaskId;

    @Nullable
    private Boolean isParentTaskToUpdate;
}
