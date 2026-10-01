package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerResponse;
import com.dentalstack.patient.feature.order.dto.OrderCommentsResponse;
import com.dentalstack.patient.feature.order.enums.OrderType;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.CaseType;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.PlanningCaseType;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientTaskTrackerResponse {

    private Long id;
    private Long patientId;
    private ZonedDateTime patientCreatedOn;
    private String patientName;
    private Long orgId;
    private Long workflowId;
    private String workflowName;
    private String workflowLabelName;
    private Long currentWorkflowStatusId;
    private String currentStatusName;
    private String currentWorkflowStatusLabelName;
    private Long previousWorkflowStatusId;

    private String gender;
    private Integer age;
    private String createdBy;
    private LocalDateTime createdOn;
    private LocalDateTime updatedOn;
    private String product;
    private LocalDateTime followUpDate;
    private CaseType caseType;
    private String assignee;
    private Long assigneeId;
    private String clinic;

    private Long createdForProfileId;
    private String createdForProfileName;
    private String orderType;
    private String priorityLevel;
    private String practiceName;
    private Integer commentsCount;
    private List<String> labels;
    private Boolean isActive;
    private Boolean isArchived;
    private LocalDateTime completionDate;
    private LocalDateTime estimatedCompletionDate;
    private Integer sequenceNumber;
    private Integer workflowPosition;
    private Long parentTaskId;
    private String orderId;
    private Long manufacturingBatchId;
    private String taskType;
    private String taskCreatedFor;
    private JsonNode serviceProducts;
    private JsonNode manufacturingProducts;
    private PlanningCaseType planningCaseType;
    private String customerMappedId;
    private UnprocessedAlignerResponse manufacturingBatchResponse;
    private ManufacturingMetadataResponse manufacturingSubTaskResponse;
    private List<OrderCommentsResponse> comments;
    private Boolean customerProfileExists;
    private OrderType taskOrderType;
    private String productType;
    private String productName;
    private String productDescription;
    private String productImage;
    private Boolean isClonedOrder;
}
