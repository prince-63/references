package com.dentalstack.patient.feature.mcp.dto.summery;

public interface PatientDetailedSummary {

    Long getPatientId();

    String getFirstName();

    String getLastName();

    String getEmail();

    String getMobileNumber();

    String getCustomerMappedId();

    String getProfilePictureUrl();

    String getUuid();

    Long getTotalTreatmentPlans();

    Long getDraftInProgressCount();

    Long getInProgressCount();

    Long getSentForApprovalCount();

    Long getPendingApprovalCount();

    Long getApprovedCount();

    Long getActiveCount();

    Long getArchivedCount();

    Long getRePlanCount();

    Long getDeactivatedCount();

    Long getTotalOrders();

    Long getOrderedCount();

    Long getOrderInProgressCount();

    Long getOrderInReviewCount();

    Long getOrderOnHoldCount();

    Long getOrderRePlanCount();

    Long getOrderApprovedCount();

    Long getOrderCompletedCount();

    Long getOrderDraftCount();

    Long getOrderNeedMoreInfoCount();

    Long getOrderCancelledCount();

    Long getOrderStlFilesRequestedCount();

    Long getOrderStlFilesUploadedCount();

    Long getOrderNewCount();

    Long getOrderUnassignedCount();

    Long getOrderUrgentCount();

    Long getTotalManufacturingBatches();

    Integer getTotalAlignersDelivered();

    Integer getTotalAlignersInInventory();

    Integer getTotalAlignersInTransit();

    Integer getTotalAlignersPending();

    Boolean getCaseRecordAdded();

    Boolean getPrescriptionAdded();

    Boolean getAlignerJourneyAdded();

    Boolean getTreatmentStarted();

    Long getTotalAlignerJourneys();

    Long getAlignerJourneyNotStartedCount();

    Long getAlignerJourneyInProgressCount();

    Long getAlignerJourneyCompletedCount();

    Long getAlignerJourneyDeactivatedCount();

    Long getAlignerJourneyOnHoldCount();

    Long getAlignerJourneyCancelledCount();
}
