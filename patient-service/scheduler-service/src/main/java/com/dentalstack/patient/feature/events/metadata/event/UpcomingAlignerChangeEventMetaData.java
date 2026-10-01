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
public class UpcomingAlignerChangeEventMetaData extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AlignerJourneyDetails alignerJourneyDetails;

    @JsonCreator
    public UpcomingAlignerChangeEventMetaData(AlignerJourneyDetails alignerJourneyDetails) {
        super(EventMetadataType.UPCOMING_ALIGNER_CHANGE);
        this.alignerJourneyDetails = alignerJourneyDetails;
    }
}
