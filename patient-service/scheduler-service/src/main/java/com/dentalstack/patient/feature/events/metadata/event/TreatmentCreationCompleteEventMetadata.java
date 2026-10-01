package com.dentalstack.patient.feature.events.metadata.event;

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
public class TreatmentCreationCompleteEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AlignerJourneyDetails alignerJourneyDetails;

    @JsonCreator
    public TreatmentCreationCompleteEventMetadata(AlignerJourneyDetails alignerJourneyDetails) {
        super(EventMetadataType.TREATMENT_CREATION_COMPLETE);
        this.alignerJourneyDetails = alignerJourneyDetails;
    }
}
