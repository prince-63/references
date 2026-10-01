package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class WearDaysUpdateEventMetaData extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AlignerJourneyDetails alignerJourneyDetails;
    private boolean isMultipleAlignerUpdated;
    private List<AlignerChangeData> alignerChanges;

    @JsonCreator
    public WearDaysUpdateEventMetaData(
            AlignerJourneyDetails alignerJourneyDetails,
            boolean isMultipleAlignerUpdated,
            List<AlignerChangeData> alignerChanges) {
        super(EventMetadataType.WEAR_DAYS_UPDATED);
        this.alignerJourneyDetails = alignerJourneyDetails;
        this.isMultipleAlignerUpdated = isMultipleAlignerUpdated;
        this.alignerChanges = alignerChanges;
    }
}
