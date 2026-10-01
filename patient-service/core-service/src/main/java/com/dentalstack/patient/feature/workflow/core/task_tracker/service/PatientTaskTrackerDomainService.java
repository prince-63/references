package com.dentalstack.patient.feature.workflow.core.task_tracker.service;

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
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.TaskCreatedFor;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.TaskType;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.Workflow;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowStatus;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.annotation.Nullable;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class PatientTaskTrackerDomainService {

    public PatientTaskTracker moveTask(
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

    public PatientTaskTracker moveTaskVsp(
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

    public PatientTaskTracker createPatientTask(
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

    public PatientTaskTracker createNextManufacturingTask(
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

    public PatientTaskTracker createChildTaskForOrder(
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

    public PatientTaskTracker createOrderTask(
            Patient patient,
            Order order,
            UserProfile createdByProfile,
            Workflow workflow,
            WorkflowStatus initialStatus,
            ServiceProduct serviceProduct) {

        Long serviceProductId = extractServiceProductId(order.getServiceProducts());
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

    public PatientTaskTracker createSubTaskForManufacturingOrder(
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

    public PatientTaskTrackerResponse buildPatientTaskResponse(PatientTaskTracker task) {
        return PatientTaskTrackerResponse.builder()
                .id(task.getId())
                .patientId(task.getPatient().getId())
                .patientCreatedOn(task.getPatient().getCreatedAt())
                .patientName(task.getPatient().fullName())
                .orgId(task.getOrgId())
                .workflowId(task.getWorkflow().getId())
                .workflowName(task.getWorkflow().getName())
                .workflowLabelName(task.getWorkflow().getLabel())
                .currentWorkflowStatusId(task.getCurrentWorkflowStatus().getId())
                .currentStatusName(task.getCurrentWorkflowStatus().getName())
                .currentWorkflowStatusLabelName(task.getCurrentWorkflowStatus().getLabelName())
                .previousWorkflowStatusId(task.getPreviousWorkflowStatusId())
                .gender(task.getPatient().getGender())
                .age(task.getPatient().getAge())
                .createdBy(task.getCreatedByProfile().getUser().fullNameWithSalutation())
                .createdOn(task.getCreatedAt().toLocalDateTime())
                .updatedOn(task.getUpdatedAt().toLocalDateTime())
                .product(Optional.ofNullable(task.getPatient())
                        .map(Patient::getPatientDetailsMetadata)
                        .map(PatientDetailsMetadata::getProduct)
                        .orElse(null))
                .followUpDate(Optional.ofNullable(task.getPatient())
                        .map(Patient::getPatientDetailsMetadata)
                        .map(PatientDetailsMetadata::getNextFollowUp)
                        .orElse(null))
                .caseType(task.getCaseType())
                .assignee(
                        task.getAssignee() != null && task.getAssignee().getUser() != null
                                ? task.getAssignee().getUser().fullNameWithSalutation()
                                : null)
                .assigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                .clinic(task.getPatient().getPracticeLocationName())
                .createdForProfileId(Optional.ofNullable(task.getCreatedForProfile())
                        .map(UserProfile::getId)
                        .orElse(null))
                .createdForProfileName(Optional.ofNullable(task.getCreatedForProfile())
                        .map(profile -> profile.getUser().fullNameWithSalutation())
                        .orElse(null))
                .orderType(task.getOrderType())
                .priorityLevel(task.getPriorityLevel())
                .practiceName(task.getPracticeName())
                .labels(task.getLabels())
                .isActive(task.getIsActive())
                .isArchived(task.getIsArchived())
                .completionDate(task.getCompletionDate())
                .estimatedCompletionDate(task.getEstimatedCompletionDate())
                .sequenceNumber(task.getSequenceNumber())
                .workflowPosition(task.getWorkflowPosition())
                .parentTaskId(Optional.ofNullable(task.getParentTask())
                        .map(PatientTaskTracker::getId)
                        .orElse(null))
                .orderId(Optional.ofNullable(task.getOrder()).map(Order::getId).orElse(null))
                .manufacturingBatchId(Optional.ofNullable(task.getManufacturingBatch())
                        .map(ManufacturingBatch::getId)
                        .orElse(null))
                .taskType(
                        Optional.ofNullable(task.getTaskType()).map(Enum::name).orElse(null))
                .taskCreatedFor(Optional.ofNullable(task.getTaskCreatedFor())
                        .map(Enum::name)
                        .orElse(null))
                .serviceProducts(task.getServiceProducts())
                .manufacturingSubTaskResponse(ManufacturingMetadataResponse.from(task.getManufacturingMetadata()))
                .customerMappedId(task.getPatient().getCustomerMappedId())
                .manufacturingProducts(task.getManufacturingProducts())
                .planningCaseType(task.getPlanningCaseType())
                .taskOrderType(task.getTaskOrderType())
                .productType(
                        task.getServiceProduct() != null
                                ? task.getServiceProduct().getProductType()
                                : null)
                .productName(
                        task.getServiceProduct() != null
                                ? task.getServiceProduct().getProductName()
                                : null)
                .productDescription(
                        task.getServiceProduct() != null
                                ? task.getServiceProduct().getProductDescription()
                                : null)
                .productImage(
                        task.getServiceProduct() != null
                                ? task.getServiceProduct().getProductImage()
                                : null)
                .isClonedOrder(task.getOrder() != null && task.getOrder().getParentOrder() != null)
                .build();
    }

    public static Long extractServiceProductId(JsonNode serviceProducts) {
        if (serviceProducts == null || serviceProducts.isNull()) return null;
        try {
            if (serviceProducts.isObject() && serviceProducts.has("id")) {
                JsonNode idNode = serviceProducts.get("id");
                if (idNode != null && idNode.isNumber() && !idNode.isNull()) {
                    return idNode.asLong();
                }
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
