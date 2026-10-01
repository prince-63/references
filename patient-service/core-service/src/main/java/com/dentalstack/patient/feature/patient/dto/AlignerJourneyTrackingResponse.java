package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AlignerJourneyTrackingResponse {

    private boolean isEnabled;
    private Status status;
    private TrackingType type;
    private Long trackingId;
    private boolean askPatientToFill;
    private boolean hasPatientSentData;
    private PatientDataFillStatus patientDataFillStatus;
    private LocalDate startDate;
    private LocalDate endDate;

    public static AlignerJourneyTrackingResponse from(Tracking tracking) {
        LocalDate currentAlignerStartDate = null;
        LocalDate currentAlignerEndDate = null;

        var currentAligner = tracking != null
                ? tracking.getAlignerJourney() != null
                        ? tracking.getAlignerJourney().getCurrentAligner()
                        : null
                : null;

        if (currentAligner != null) {
            currentAlignerStartDate = currentAligner.getStartDate();
            currentAlignerEndDate = currentAligner.getEndDate();
        }

        return AlignerJourneyTrackingResponse.builder()
                .isEnabled(tracking != null && tracking.getStatus().equals(Status.ACTIVE)
                        || tracking != null && tracking.getStatus().equals(Status.PAUSED))
                .startDate(currentAlignerStartDate)
                .endDate(currentAlignerEndDate)
                .status(tracking != null ? tracking.getStatus() : null)
                .type(tracking != null ? tracking.getTrackingType() : null)
                .trackingId(tracking != null ? tracking.getId() : null)
                .askPatientToFill(tracking != null && tracking.getAskPatientToFill())
                .hasPatientSentData(tracking != null && tracking.getSendToPatient())
                .patientDataFillStatus(tracking != null ? tracking.getPatientDataFillStatus() : null)
                .build();
    }
}
