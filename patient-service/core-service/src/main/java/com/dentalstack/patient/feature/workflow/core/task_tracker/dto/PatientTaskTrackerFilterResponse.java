package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerResponse;
import com.dentalstack.patient.feature.order.enums.OrderType;
import com.dentalstack.patient.feature.user.entity.User;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.CaseType;
import com.dentalstack.patient.feature.workflow.core.task_tracker.projection.PatientTaskTrackerProjection;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientTaskTrackerFilterResponse {

    private Long id;
    private Long patientId;
    private String patientName;
    private Long orgId;
    private Long workflowId;
    private String workflowName;
    private Long currentWorkflowStatusId;
    private String currentStatusName;
    private Long previousWorkflowStatusId;

    private String gender;
    private Integer age;
    private String createdBy;
    private LocalDateTime createdOn;
    private String product;
    private LocalDateTime followUpDate;
    private CaseType caseType;
    private String assignee;
    private String clinic;

    private Long createdForProfileId;
    private String createdForProfileName;
    private String orderType;
    private String priorityLevel;
    private String practiceName;
    private Integer commentsCount;
    private List<String> labels;
    private String linkedPlans;
    private String linkedBatchDetails;
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
    private String customerMappedId;
    private JsonNode serviceProducts;
    private UnprocessedAlignerResponse manufacturingBatchResponse;
    private List<LabelCountResponse> ongoingLabelCounts;
    private String patientCreatedBy;
    private String customerName;
    private Boolean customerProfileExists;
    private OrderType taskOrderType;
    private String productType;
    private String productName;
    private String productDescription;
    private String productImage;
    private Boolean isClonedOrder;

    public static PatientTaskTrackerFilterResponse from(
            PatientTaskTrackerProjection projection,
            UnprocessedAlignerResponse manufacturingBatchResponse,
            List<LabelCountResponse> ongoingLabelCounts,
            PatientTaskTrackerFilterRequestDTO request,
            UserProfile userProfile) {
        if (projection == null) {
            return null;
        }
        ObjectMapper objectMapper = new ObjectMapper();

        String serviceProductsJson = projection.getServiceProducts();
        JsonNode serviceProducts = null;

        if (serviceProductsJson != null) {
            try {
                serviceProducts = objectMapper.readTree(serviceProductsJson);
            } catch (Exception e) {

            }
        }

        var isPractice = userProfile.isPractice();
        return PatientTaskTrackerFilterResponse.builder()
                .id(projection.getId())
                .patientId(projection.getPatientId())
                .patientName(projection.getPatientName())
                .orgId(projection.getOrgId())
                .workflowId(projection.getWorkflowId())
                .workflowName(projection.getWorkflowName())
                .currentWorkflowStatusId(projection.getCurrentWorkflowStatusId())
                .currentStatusName(projection.getCurrentStatusName())
                .previousWorkflowStatusId(projection.getPreviousWorkflowStatusId())
                .gender(projection.getGender())
                .age(projection.getAge())
                .createdBy(User.getFullNameWithSalutation(
                        projection.getCreatedBySalutation(),
                        projection.getCreatedByFirstName(),
                        projection.getCreatedByLastName()))
                .createdOn(projection.getCreatedOn())
                .product(projection.getProduct())
                .assignee(User.getFullNameWithSalutation(
                        projection.getAssigneeSalutation(),
                        projection.getAssigneeFirstName(),
                        projection.getAssigneeLastName()))
                .createdForProfileId(projection.getCreatedForProfileId())
                .createdForProfileName(projection.getCreatedForProfileName())
                .orderType(projection.getOrderType())
                .priorityLevel(projection.getPriorityLevel())
                .practiceName(projection.getPracticeName())
                .commentsCount(projection.getCommentsCount())
                .labels(projection.getLabels())
                .linkedPlans(projection.getLinkedPlans())
                .linkedBatchDetails(projection.getLinkedBatchDetails())
                .isActive(projection.getIsActive())
                .isArchived(projection.getIsArchived())
                .completionDate(projection.getCompletionDate())
                .estimatedCompletionDate(projection.getEstimatedCompletionDate())
                .sequenceNumber(projection.getSequenceNumber())
                .workflowPosition(projection.getWorkflowPosition())
                .parentTaskId(projection.getParentTaskId())
                .orderId(projection.getOrderId())
                .manufacturingBatchId(projection.getManufacturingBatchId())
                .taskType(projection.getTaskType())
                .taskCreatedFor(projection.getTaskCreatedFor())
                .serviceProducts(serviceProducts)
                .manufacturingBatchResponse(manufacturingBatchResponse)
                .customerMappedId(projection.getCustomerMappedId())
                .followUpDate(null)
                .caseType(
                        projection.getCaseType() != null
                                ? CaseType.valueOf(projection.getCaseType())
                                : CaseType.NEW_CASE)
                .clinic(projection.getClinicName())
                .ongoingLabelCounts(ongoingLabelCounts)
                .patientCreatedBy(User.getFullNameWithSalutation(
                        projection.getPatientAddedBySalutation(),
                        projection.getPatientAddedByFirstName(),
                        projection.getPatientAddedByLastName()))
                .customerName(User.getFullNameWithSalutation(
                        projection.getPatientCustomerSalutation(),
                        projection.getPatientCustomerFirstName(),
                        projection.getPatientCustomerLastName()))
                .customerProfileExists(isPractice
                        || !Objects.equals(request.getProfileId(), projection.getPatientCustomerUserProfileId()))
                .taskOrderType(projection.getTaskOrderType() != null ? projection.getTaskOrderType() : null)
                .productType(projection.getProductType())
                .productName(projection.getProductName())
                .productDescription(projection.getProductDescription())
                .productImage(projection.getProductImage())
                .isClonedOrder(projection.getIsCloned())
                .build();
    }
}
