package com.dentalstack.patient.feature.workflow.core.task_tracker.entity;

import static com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerServiceImpl.ALIGNER_ORDER_TYPE;

import com.dentalstack.patient.feature.order.dto.CreateManufacturingRequest;
import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.enums.OrderType;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.entity.PatientDetailsMetadata;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.vsp.entity.VspOrder;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.CreatePatientTaskTrackerRequestDto;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.ManufacturingMetadata;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.ManufacturingMetadataResponse;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.PatientTaskTrackerResponse;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.CaseType;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.PlanningCaseType;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.TaskCreatedFor;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.TaskType;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.Workflow;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowStatus;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "patient_task_tracker",
        indexes = {
            @Index(name = "idx_task_parent", columnList = "parent_task_id"),
            @Index(name = "idx_task_order", columnList = "order_id"),
            @Index(name = "idx_task_manufacturing_batch", columnList = "manufacturing_batch_id")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class PatientTaskTracker extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(name = "org_id", nullable = false)
    private Long orgId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_profile_id", nullable = false)
    private UserProfile createdByProfile;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_for_profile_id")
    private UserProfile createdForProfile;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private UserProfile assignee;

    @NotNull
    @Column(name = "order_type")
    private String orderType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    private Workflow workflow;

    @Column(name = "workflow_name")
    private String workflowName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_workflow_status_id", nullable = false)
    private WorkflowStatus currentWorkflowStatus;

    @Column(name = "current_status_name")
    private String currentStatusName;

    @Column(name = "previous_workflow_status_id")
    private Long previousWorkflowStatusId;

    @Column(name = "priority_level")
    private String priorityLevel;

    @Column(name = "practice_name")
    private String practiceName;

    @Column(name = "labels", columnDefinition = "jsonb")
    @org.hibernate.annotations.Type(JsonType.class)
    private List<String> labels;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_archived")
    @Builder.Default
    private Boolean isArchived = false;

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    @Column(name = "estimated_completion_date")
    private LocalDateTime estimatedCompletionDate;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private WorkFlowManagementMetadata metadata;

    @Column(name = "sequence_number")
    private Integer sequenceNumber;

    @Column(name = "workflow_position")
    private Integer workflowPosition;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_task_id")
    private PatientTaskTracker parentTask;

    @OneToMany(mappedBy = "parentTask", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PatientTaskTracker> childTasks = new ArrayList<>();

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vsp_order_id")
    private VspOrder vspOrder;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturing_batch_id")
    private ManufacturingBatch manufacturingBatch;

    @Enumerated(EnumType.STRING)
    private TaskType taskType;

    @Enumerated(EnumType.STRING)
    private TaskCreatedFor taskCreatedFor;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode serviceProducts;

    private Long serviceProductId;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_products_id", referencedColumnName = "id")
    private ServiceProduct serviceProduct;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode manufacturingProducts;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(name = "manufacturing_metadata", columnDefinition = "jsonb")
    private WorkFlowManagementMetadata manufacturingMetadata;

    @Enumerated(EnumType.STRING)
    private PlanningCaseType planningCaseType;

    @Enumerated(EnumType.STRING)
    private CaseType caseType;

    private Integer manufacturingBatchSequenceNumber;

    @Enumerated(EnumType.STRING)
    private OrderType taskOrderType;

    public static PatientTaskTracker moveTask(
            PatientTaskTracker existing,
            Workflow workflow,
            WorkflowStatus newStatus,
            JsonNode serviceProducts,
            ManufacturingBatch manufacturingBatch,
            Order order,
            ServiceProduct serviceProduct) {
        existing.setServiceProducts(serviceProducts);
        existing.setPreviousWorkflowStatusId(existing.getCurrentWorkflowStatus().getId());
        existing.setWorkflow(workflow);
        existing.setWorkflowName(workflow.getName());
        existing.setCurrentWorkflowStatus(newStatus);
        existing.setCurrentStatusName(newStatus.getName());
        existing.setWorkflowPosition(newStatus.getPosition());
        existing.setManufacturingBatch(manufacturingBatch);
        existing.setOrder(order);
        existing.setTaskOrderType(order != null ? order.getOrderType() : null);
        existing.setManufacturingBatchSequenceNumber(
                manufacturingBatch != null ? manufacturingBatch.getBatchNumber() : null);
        existing.setServiceProduct(serviceProduct);
        return existing;
    }

    public static PatientTaskTracker moveTaskVsp(
            PatientTaskTracker existing,
            Workflow workflow,
            WorkflowStatus newStatus,
            VspOrder order,
            ServiceProduct serviceProduct) {
        existing.setPreviousWorkflowStatusId(existing.getCurrentWorkflowStatus().getId());
        existing.setWorkflow(workflow);
        existing.setWorkflowName(workflow.getName());
        existing.setCurrentWorkflowStatus(newStatus);
        existing.setCurrentStatusName(newStatus.getName());
        existing.setWorkflowPosition(newStatus.getPosition());
        existing.setVspOrder(order);
        existing.setServiceProduct(serviceProduct);
        return existing;
    }

    public static PatientTaskTracker createPatientTask(
            Patient patient,
            UserProfile createdByProfile,
            Workflow workflow,
            WorkflowStatus initialStatus,
            CreatePatientTaskTrackerRequestDto request,
            UserProfile assignee) {

        return PatientTaskTracker.builder()
                .patient(patient)
                .orgId(request.getOrganizationId())
                .createdByProfile(createdByProfile)
                .assignee(assignee != null ? assignee : createdByProfile)
                .orderType(request.getOrderType())
                .workflow(workflow)
                .workflowName(workflow.getName())
                .currentWorkflowStatus(initialStatus)
                .currentStatusName(initialStatus.getName())
                .priorityLevel(request.getPriorityLevel())
                .practiceName(request.getPracticeName())
                .labels(request.getLabels())
                .estimatedCompletionDate(request.getEstimatedCompletionDate())
                .sequenceNumber(request.getSequenceNumber())
                .workflowPosition(initialStatus.getPosition())
                .metadata(request.getMetadata())
                .isActive(true)
                .isArchived(false)
                .caseType(request.getCaseType())
                .build();
    }

    public static PatientTaskTracker createNextManufacturingTask(
            UserProfile userProfile,
            ManufacturingBatch manufacturingBatch,
            CreateManufacturingRequest request,
            Workflow workflow,
            WorkflowStatus initialStatus,
            UserProfile assigneeProfile,
            @Nullable PatientTaskTracker parentTask,
            ServiceProduct serviceProduct) {

        return PatientTaskTracker.builder()
                .patient(manufacturingBatch.getTreatmentPlan().getPatient())
                .orgId(userProfile.getOrganization().getId())
                .createdByProfile(userProfile)
                .assignee(assigneeProfile != null ? assigneeProfile : userProfile)
                .orderType(ALIGNER_ORDER_TYPE)
                .workflow(workflow)
                .workflowName(workflow.getName())
                .currentWorkflowStatus(initialStatus)
                .currentStatusName(initialStatus.getName())
                .priorityLevel("MEDIUM")
                .practiceName(userProfile.getUser().fullNameWithSalutation())
                .isActive(true)
                .isArchived(false)
                .sequenceNumber(0)
                .workflowPosition(initialStatus.getPosition())
                .taskType(request.getTaskType())
                .taskCreatedFor(TaskCreatedFor.MANUFACTURING_LAB)
                .manufacturingBatch(manufacturingBatch)
                .serviceProductId(request.getServiceProductId())
                .serviceProducts(request.getServiceProducts())
                .manufacturingBatchSequenceNumber(manufacturingBatch.getBatchNumber())
                .parentTask(parentTask)
                .serviceProduct(serviceProduct)
                .build();
    }

    public static PatientTaskTracker createChildTaskForOrder(
            PatientTaskTracker parentTask,
            @Nullable Order order,
            UserProfile createdByProfile,
            UserProfile createdForProfile,
            Workflow workflow,
            WorkflowStatus initialStatus,
            JsonNode serviceProducts,
            @Nullable ManufacturingBatch manufacturingBatch,
            TaskType taskType,
            Long serviceProductId,
            ServiceProduct serviceProduct) {

        return PatientTaskTracker.builder()
                .patient(parentTask.getPatient())
                .orgId(createdByProfile.getOrganization().getId())
                .createdByProfile(createdByProfile)
                .assignee(createdForProfile)
                .createdForProfile(createdForProfile)
                .orderType(parentTask.getOrderType())
                .workflow(workflow)
                .workflowName(workflow.getName())
                .currentWorkflowStatus(initialStatus)
                .currentStatusName(initialStatus.getName())
                .priorityLevel(parentTask.getPriorityLevel())
                .practiceName(createdByProfile.getUser().fullNameWithSalutation())
                .serviceProducts(serviceProducts)
                .isActive(true)
                .isArchived(false)
                .sequenceNumber(0)
                .taskCreatedFor(
                        manufacturingBatch != null ? TaskCreatedFor.MANUFACTURING_LAB : TaskCreatedFor.DESIGN_LAB)
                .workflowPosition(initialStatus.getPosition())
                .parentTask(parentTask)
                .order(
                        manufacturingBatch != null
                                ? manufacturingBatch.getOrder() != null ? manufacturingBatch.getOrder() : order
                                : order)
                .taskType(taskType)
                .manufacturingBatch(manufacturingBatch)
                .serviceProductId(serviceProductId)
                .manufacturingBatchSequenceNumber(
                        manufacturingBatch != null ? manufacturingBatch.getBatchNumber() : null)
                .taskOrderType(order != null ? order.getOrderType() : null)
                .serviceProduct(serviceProduct)
                .build();
    }

    public static PatientTaskTracker createOrderTask(
            Patient patient,
            Order order,
            UserProfile createdByProfile,
            Workflow workflow,
            WorkflowStatus initialStatus,
            ServiceProduct serviceProduct) {

        var serviceProductId = getServiceProductId(order.getServiceProducts());
        return PatientTaskTracker.builder()
                .patient(patient)
                .orgId(createdByProfile.getOrganization().getId())
                .createdByProfile(createdByProfile)
                .assignee(createdByProfile)
                .createdForProfile(createdByProfile)
                .orderType(ALIGNER_ORDER_TYPE)
                .workflow(workflow)
                .workflowName(workflow.getName())
                .currentWorkflowStatus(initialStatus)
                .currentStatusName(initialStatus.getName())
                .priorityLevel("MEDIUM")
                .practiceName(createdByProfile.getUser().fullNameWithSalutation())
                .isActive(true)
                .isArchived(false)
                .sequenceNumber(0)
                .taskCreatedFor(TaskCreatedFor.DESIGN_LAB)
                .workflowPosition(initialStatus.getPosition())
                .order(order)
                .taskType(TaskType.OUTSOURCED_PLANNING_ORDER)
                .serviceProducts(order.getServiceProducts())
                .serviceProductId(serviceProductId)
                .serviceProduct(serviceProduct)
                .taskOrderType(OrderType.PLANNING_ORDER)
                .build();
    }

    public static PatientTaskTracker createSubTaskForManufacturingOrder(
            PatientTaskTracker parentTask,
            UserProfile createdByProfile,
            Workflow workflow,
            WorkflowStatus initialStatus,
            @Nullable ManufacturingBatch manufacturingBatch,
            ManufacturingMetadata manufacturingMetadata,
            Long serviceProductId,
            JsonNode serviceProducts,
            UserProfile assigneeProfile,
            ServiceProduct serviceProduct) {

        return PatientTaskTracker.builder()
                .patient(parentTask.getPatient())
                .orgId(parentTask.getOrgId())
                .createdByProfile(createdByProfile)
                .assignee(assigneeProfile != null ? assigneeProfile : createdByProfile)
                .orderType(parentTask.getOrderType())
                .workflow(workflow)
                .workflowName(workflow.getName())
                .currentWorkflowStatus(initialStatus)
                .currentStatusName(initialStatus.getName())
                .isActive(true)
                .isArchived(false)
                .taskCreatedFor(TaskCreatedFor.MANUFACTURING_LAB)
                .workflowPosition(initialStatus.getPosition())
                .parentTask(parentTask)
                .taskType(TaskType.MANUFACTURING_ALIGNER_SUB_TASK)
                .manufacturingBatch(manufacturingBatch)
                .manufacturingMetadata(manufacturingMetadata)
                .serviceProductId(serviceProductId)
                .serviceProducts(serviceProducts)
                .manufacturingBatchSequenceNumber(
                        manufacturingBatch != null ? manufacturingBatch.getBatchNumber() : null)
                .serviceProduct(serviceProduct)
                .build();
    }

    public static Long getServiceProductId(JsonNode serviceProducts) {
        if (serviceProducts == null || serviceProducts.isNull()) {
            return null;
        }

        try {
            if (serviceProducts.isObject() && serviceProducts.has("id")) {
                JsonNode idNode = serviceProducts.get("id");
                if (idNode != null && idNode.isNumber() && !idNode.isNull()) {
                    return idNode.asLong();
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error extracting product ID from serviceProducts: " + e.getMessage());
            return null;
        }
    }

    public static PatientTaskTrackerResponse buildPatientTaskResponse(PatientTaskTracker patientTaskTracker) {
        return PatientTaskTrackerResponse.builder()
                .id(patientTaskTracker.getId())
                .patientId(patientTaskTracker.getPatient().getId())
                .patientCreatedOn(patientTaskTracker.getPatient().getCreatedAt())
                .patientName(patientTaskTracker.getPatient().fullName())
                .orgId(patientTaskTracker.getOrgId())
                .workflowId(patientTaskTracker.getWorkflow().getId())
                .workflowName(patientTaskTracker.getWorkflow().getName())
                .workflowLabelName(patientTaskTracker.getWorkflow().getLabel())
                .currentWorkflowStatusId(
                        patientTaskTracker.getCurrentWorkflowStatus().getId())
                .currentStatusName(patientTaskTracker.getCurrentWorkflowStatus().getName())
                .currentWorkflowStatusLabelName(
                        patientTaskTracker.getCurrentWorkflowStatus().getLabelName())
                .previousWorkflowStatusId(patientTaskTracker.getPreviousWorkflowStatusId())
                .gender(patientTaskTracker.getPatient().getGender())
                .age(patientTaskTracker.getPatient().getAge())
                .createdBy(patientTaskTracker.getCreatedByProfile().getUser().fullNameWithSalutation())
                .createdOn(patientTaskTracker.getCreatedAt().toLocalDateTime())
                .updatedOn(patientTaskTracker.getUpdatedAt().toLocalDateTime())
                .product(Optional.ofNullable(patientTaskTracker.getPatient())
                        .map(Patient::getPatientDetailsMetadata)
                        .map(PatientDetailsMetadata::getProduct)
                        .orElse(null))
                .followUpDate(Optional.ofNullable(patientTaskTracker.getPatient())
                        .map(Patient::getPatientDetailsMetadata)
                        .map(PatientDetailsMetadata::getNextFollowUp)
                        .orElse(null))
                .caseType(patientTaskTracker.getCaseType())
                .assignee(
                        patientTaskTracker.getAssignee() != null
                                        && patientTaskTracker.getAssignee().getUser() != null
                                ? patientTaskTracker.getAssignee().getUser().fullNameWithSalutation()
                                : null)
                .assigneeId(
                        patientTaskTracker.getAssignee() != null
                                ? patientTaskTracker.getAssignee().getId()
                                : null)
                .clinic(patientTaskTracker.getPatient().getPracticeLocationName())
                .createdForProfileId(Optional.ofNullable(patientTaskTracker.getCreatedForProfile())
                        .map(UserProfile::getId)
                        .orElse(null))
                .createdForProfileName(Optional.ofNullable(patientTaskTracker.getCreatedForProfile())
                        .map(profile -> profile.getUser().fullNameWithSalutation())
                        .orElse(null))
                .orderType(patientTaskTracker.getOrderType())
                .priorityLevel(patientTaskTracker.getPriorityLevel())
                .practiceName(patientTaskTracker.getPracticeName())
                .labels(patientTaskTracker.getLabels())
                .isActive(patientTaskTracker.getIsActive())
                .isArchived(patientTaskTracker.getIsArchived())
                .completionDate(patientTaskTracker.getCompletionDate())
                .estimatedCompletionDate(patientTaskTracker.getEstimatedCompletionDate())
                .sequenceNumber(patientTaskTracker.getSequenceNumber())
                .workflowPosition(patientTaskTracker.getWorkflowPosition())
                .parentTaskId(Optional.ofNullable(patientTaskTracker.getParentTask())
                        .map(PatientTaskTracker::getId)
                        .orElse(null))
                .orderId(Optional.ofNullable(patientTaskTracker.getOrder())
                        .map(Order::getId)
                        .orElse(null))
                .manufacturingBatchId(Optional.ofNullable(patientTaskTracker.getManufacturingBatch())
                        .map(ManufacturingBatch::getId)
                        .orElse(null))
                .taskType(Optional.ofNullable(patientTaskTracker.getTaskType())
                        .map(Enum::name)
                        .orElse(null))
                .taskCreatedFor(Optional.ofNullable(patientTaskTracker.getTaskCreatedFor())
                        .map(Enum::name)
                        .orElse(null))
                .serviceProducts(patientTaskTracker.getServiceProducts())
                .manufacturingSubTaskResponse(
                        ManufacturingMetadataResponse.from(patientTaskTracker.getManufacturingMetadata()))
                .customerMappedId(patientTaskTracker.getPatient().getCustomerMappedId())
                .manufacturingProducts(
                        patientTaskTracker.getManufacturingProducts() != null
                                ? patientTaskTracker.getManufacturingProducts()
                                : null)
                .planningCaseType(
                        patientTaskTracker.getPlanningCaseType() != null
                                ? patientTaskTracker.getPlanningCaseType()
                                : null)
                .taskOrderType(
                        patientTaskTracker.getTaskOrderType() != null ? patientTaskTracker.getTaskOrderType() : null)
                .productType(
                        patientTaskTracker.getServiceProduct() != null
                                ? patientTaskTracker.getServiceProduct().getProductType()
                                : null)
                .productName(
                        patientTaskTracker.getServiceProduct() != null
                                ? patientTaskTracker.getServiceProduct().getProductName()
                                : null)
                .productDescription(
                        patientTaskTracker.getServiceProduct() != null
                                ? patientTaskTracker.getServiceProduct().getProductDescription()
                                : null)
                .productImage(
                        patientTaskTracker.getServiceProduct() != null
                                ? patientTaskTracker.getServiceProduct().getProductImage()
                                : null)
                .isClonedOrder(patientTaskTracker.getOrder() != null
                        && patientTaskTracker.getOrder().getParentOrder() != null)
                .build();
    }
}
