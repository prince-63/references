package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.tracking.enums.TrackingType;
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

    public static AlignerJourneyTrackingResponse from(Tracking tracking) {
        return AlignerJourneyTrackingResponse.builder()
                .isEnabled(tracking != null && tracking.getStatus().equals(Status.ACTIVE)
                        || tracking != null && tracking.getStatus().equals(Status.PAUSED))
                .status(tracking != null ? tracking.getStatus() : null)
                .type(tracking != null ? tracking.getTrackingType() : null)
                .trackingId(tracking != null ? tracking.getId() : null)
                .askPatientToFill(tracking != null && tracking.getAskPatientToFill())
                .hasPatientSentData(tracking != null && tracking.getSendToPatient())
                .patientDataFillStatus(tracking != null ? tracking.getPatientDataFillStatus() : null)
                .build();
    }
}
