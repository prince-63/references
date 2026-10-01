package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class MissedAlignerChangeDateEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private PatientDetails patientDetails;
    private Integer nextAlignerNo;
    private Integer delayedDays;

    @JsonCreator
    public MissedAlignerChangeDateEventMetadata(
            PatientDetails patientDetails, Integer nextAlignerNo, Integer delayedDays) {
        super(EventMetadataType.MISSED_ALIGNER_CHANGED_DATE);
        this.patientDetails = patientDetails;
        this.nextAlignerNo = nextAlignerNo;
        this.delayedDays = delayedDays;
    }
}
