package com.dentalstack.patient.feature.workflow.core.task_tracker.projection;

import com.dentalstack.patient.feature.order.enums.OrderType;
import java.time.LocalDateTime;
import java.util.List;

public interface PatientTaskTrackerProjection {
    Long getId();

    Long getPatientId();

    String getPatientName();

    Long getOrgId();

    Long getWorkflowId();

    String getWorkflowName();

    Long getCurrentWorkflowStatusId();

    String getCurrentStatusName();

    Long getPreviousWorkflowStatusId();

    String getGender();

    Integer getAge();

    String getCreatedByFirstName();

    String getCreatedByLastName();

    String getCreatedBySalutation();

    LocalDateTime getCreatedOn();

    String getCaseType();

    String getProduct();

    String getAssigneeFirstName();

    String getAssigneeLastName();

    String getAssigneeSalutation();

    Long getCreatedForProfileId();

    String getCreatedForProfileName();

    String getOrderType();

    String getPriorityLevel();

    String getPracticeName();

    Integer getCommentsCount();

    List<String> getLabels();

    String getLinkedPlans();

    String getLinkedBatchDetails();

    Boolean getIsActive();

    Boolean getIsArchived();

    LocalDateTime getCompletionDate();

    LocalDateTime getEstimatedCompletionDate();

    Integer getSequenceNumber();

    Integer getWorkflowPosition();

    Long getParentTaskId();

    String getOrderId();

    Long getManufacturingBatchId();

    String getCustomerMappedId();

    String getTaskType();

    String getTaskCreatedFor();

    Long getTreatmentPlanId();

    String getServiceProducts();

    Integer getManufacturingBatchSequenceNumber();

    Integer getPackagedOngoingProductListCount();

    String getClinicName();

    String getPatientAddedByFirstName();

    String getPatientAddedByLastName();

    String getPatientAddedBySalutation();

    String getPatientCustomerFirstName();

    String getPatientCustomerLastName();

    String getPatientCustomerSalutation();

    Long getPatientCustomerUserProfileId();

    OrderType getTaskOrderType();

    String getProductType();

    String getProductName();

    String getProductDescription();

    String getProductImage();

    Boolean getIsCloned();
}
