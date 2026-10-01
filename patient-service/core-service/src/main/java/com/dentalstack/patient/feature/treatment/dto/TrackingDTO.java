package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TrackingDTO {

    private Long trackingId;
    private TrackingType type;
    private Status status;
    private Boolean askPatientToFill;
    private Boolean hasPatientSentData;

    public static TrackingDTO from(Tracking tracking) {
        return TrackingDTO.builder()
                .trackingId(tracking.getId())
                .type(tracking.getTrackingType())
                .status(tracking.getStatus())
                .askPatientToFill(tracking.getAskPatientToFill())
                .hasPatientSentData(
                        tracking.getPatientDataFillStatus() == PatientDataFillStatus.PATIENT_FILLED_DATA ? true : false)
                .build();
    }
}
