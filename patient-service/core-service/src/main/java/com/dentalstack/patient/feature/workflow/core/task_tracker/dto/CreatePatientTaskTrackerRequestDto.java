package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.CaseType;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePatientTaskTrackerRequestDto {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Workflow ID is required")
    private Long workflowId;

    @NotNull(message = "Initial workflow status ID is required")
    private Long initialWorkflowStatusId;

    @NotNull(message = "Order type is required")
    private String orderType;

    private Long profileId;
    private Long organizationId;

    private Long assigneeId;
    private Long cardDisplayConfigId;

    @Builder.Default
    private String priorityLevel = "Medium";

    private String practiceName;
    private List<String> labels;
    private String linkedPlans;
    private String linkedBatchDetails;
    private LocalDateTime estimatedCompletionDate;

    @Builder.Default
    private Integer sequenceNumber = 0;

    private WorkFlowManagementMetadata metadata;

    @Builder.Default
    private CaseType caseType = CaseType.NEW_CASE;

    @Nullable
    private Long parentTaskTrackerId;
}
