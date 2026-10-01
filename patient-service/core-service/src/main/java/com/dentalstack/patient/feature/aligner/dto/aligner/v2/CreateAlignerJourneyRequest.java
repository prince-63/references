package com.dentalstack.patient.feature.aligner.dto.aligner.v2;

import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.patient.dto.TreatmentPlanRequest;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.user.enums.UserType;
import jakarta.annotation.Nullable;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateAlignerJourneyRequest {
    private TrackingType trackingType;
    private CurrentAlignerDetails currentAlignerDetails;
    private UserType userType;
    private BigDecimal pricing;
    private Status status;
    private long alignerTreatmentPlanId;
    private String doctorName;
    private boolean askToPatientFill;
    private boolean isTreatmentUpdating;
    private boolean isSendToPatient;

    @Nullable
    private Boolean isTreatmentRefinement;

    private Long profileId;

    public static CreateAlignerJourneyRequest from(TreatmentPlan treatmentPlan, TreatmentPlanRequest request) {

        return CreateAlignerJourneyRequest.builder()
                .currentAlignerDetails(CurrentAlignerDetails.builder()
                        .number(request.getCurrentAlignerNo())
                        .endDate(request.getEndDate())
                        .startDate(request.getStartDate())
                        .build())
                .alignerTreatmentPlanId(treatmentPlan.getId())
                .isTreatmentRefinement(true)
                .userType(request.getUserType())
                .pricing(request.getPricing())
                .status(request.getTrackingStatus())
                .trackingType(request.getTrackingType())
                .askToPatientFill(request.isAskToPatientFill())
                .isSendToPatient(request.isAskToPatientFill())
                .build();
    }
}
