package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.braces.dto.BracesJourneyTrackingResponse;
import com.dentalstack.patient.global.enums.ProductTypeName;
import jakarta.annotation.Nullable;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LeadProfileOverviewResponse {

    private boolean isTreatmentAdded;

    private boolean isFileAdded;

    private boolean isInvited;

    private boolean isServiceSelected;

    private boolean isTreatmentPlanFilled;

    private AlignerJourneyTrackingResponse tracking;

    private TreatmentPlanTrackingResponse treatmentPlan;
    private boolean isTrackingAddedForLatestTreatmentPlan;

    @Nullable
    private BracesJourneyTrackingResponse bracesJourneyTrackingResponse;

    private Long treatmentPlanId;

    private boolean isSubscriptionEnabled;

    private boolean isSubscriptionVisitedByPatient;

    private boolean isPatientConnected;

    private boolean isTreatmentActive;
    private boolean isRefinement;
    private long doctorId;
    private List<ProductTypeName> productTypeNames;

    private String reasonForDeactivation;

    private LocalDate deactivatedAt;

    private String deactivatedRemarks;
    private LocalDate pausedAt;
    private String reasonForPause;
    private AlignerTreatmentStatus previousTreatmentPlanStatus;
    private AlignerTreatmentStatus currentTreatmentPlanStatus;
    private String gettingStartedOrderStatus;
    private AlignerTreatmentStatus treatmentPlanStatus;
    private Boolean treatmentPlanCompleted;
    private String treatmentPlanCompletedRemarks;
    private Boolean trackingAddedForActiveTreatmentPlan;
    private String gettingStartedOrderId;
    private Boolean isCustomerTrackingEnabled;
    private Boolean isCustomerStlFileViewEnabled;
    private Boolean isCustomerPrintFileViewEnabled;
    private Boolean isCustomerScanFileViewEnabled;
    private Boolean isPatientTrackingEnabled;
    private Boolean isPatientStlFileViewEnabled;
}
