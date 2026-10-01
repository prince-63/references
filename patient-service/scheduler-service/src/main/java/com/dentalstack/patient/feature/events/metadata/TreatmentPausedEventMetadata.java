package com.dentalstack.patient.feature.events.metadata;

import com.dentalstack.patient.feature.events.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.EventMetadataType;
import com.dentalstack.patient.feature.treatment.dto.AlignerJourneyDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class TreatmentPausedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AlignerJourneyDetails alignerJourneyDetails;

    @JsonCreator
    public TreatmentPausedEventMetadata(AlignerJourneyDetails alignerJourneyDetails) {
        super(EventMetadataType.TREATMENT_PAUSED);
        this.alignerJourneyDetails = alignerJourneyDetails;
    }
}
