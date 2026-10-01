package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.PlanningCaseType;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePatientTaskTrackerRequestDto {

    private Long taskId;
    private Long profileId;
    private Long organizationId;
    private Long assigneeId;
    private Long workflowStatusId;
    private String priorityLevel;
    private String practiceName;
    private List<String> labels;
    private String linkedPlans;
    private String linkedBatchDetails;
    private LocalDateTime estimatedCompletionDate;
    private Integer commentsCount;
    private Integer sequenceNumber;
    private Boolean isActive;
    private Boolean isArchived;
    private LocalDateTime completionDate;
    private WorkFlowManagementMetadata metadata;
    private JsonNode manufacturingProducts;
    private PlanningCaseType planningCaseType;
}
