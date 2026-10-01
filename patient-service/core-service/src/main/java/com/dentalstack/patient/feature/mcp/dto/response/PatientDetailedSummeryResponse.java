package com.dentalstack.patient.feature.mcp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientDetailedSummeryResponse {

    private Long patientId;
    private String firstName;
    private String lastName;
    private String email;
    private String mobileNumber;
    private String customerMappedId;
    private String profilePictureUrl;
    private String uuid;
    private String patientName;

    private Long totalTreatmentPlans;
    private Long draftInProgressCount;
    private Long inProgressCount;
    private Long sentForApprovalCount;
    private Long pendingApprovalCount;
    private Long approvedCount;
    private Long activeCount;
    private Long archivedCount;
    private Long rePlanCount;
    private Long deactivatedCount;

    private Long totalOrders;
    private Long orderedCount;
    private Long orderInProgressCount;
    private Long orderInReviewCount;
    private Long orderOnHoldCount;
    private Long orderRePlanCount;
    private Long orderApprovedCount;
    private Long orderCompletedCount;
    private Long orderDraftCount;
    private Long orderNeedMoreInfoCount;
    private Long orderCancelledCount;
    private Long orderStlFilesRequestedCount;
    private Long orderStlFilesUploadedCount;
    private Long orderNewCount;
    private Long orderUnassignedCount;
    private Long orderUrgentCount;

    private Long totalManufacturingBatches;
    private Integer totalAlignersDelivered;
    private Integer totalAlignersInInventory;
    private Integer totalAlignersInTransit;
    private Integer totalAlignersPending;

    private Boolean caseRecordAdded;
    private Boolean prescriptionAdded;
    private Boolean alignerJourneyAdded;
    private Boolean treatmentStarted;

    private Long totalAlignerJourneys;
    private Long alignerJourneyNotStartedCount;
    private Long alignerJourneyInProgressCount;
    private Long alignerJourneyCompletedCount;
    private Long alignerJourneyDeactivatedCount;
    private Long alignerJourneyOnHoldCount;
    private Long alignerJourneyCancelledCount;
    private String nextStep;
}
