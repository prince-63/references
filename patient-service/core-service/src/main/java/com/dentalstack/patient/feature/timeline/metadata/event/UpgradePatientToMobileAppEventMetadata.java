package com.dentalstack.patient.feature.timeline.metadata.event;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class UpgradePatientToMobileAppEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long patientId;
    private Long alignerJourneyId;

    @JsonCreator
    public UpgradePatientToMobileAppEventMetadata(long patientId, Long alignerJourneyId) {
        super(EventMetadataType.UPGRADE_PATIENT_TO_MOBILE_APP);
        this.patientId = patientId;
        this.alignerJourneyId = alignerJourneyId;
    }
}
