package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@JsonTypeName("TREATMENT_STARTING_TOMORROW")
public class TreatmentStartingTomorrowEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AlignerJourneyDetails alignerJourneyDetails;

    @JsonCreator
    public TreatmentStartingTomorrowEventMetadata(AlignerJourneyDetails alignerJourneyDetails) {
        super(EventMetadataType.TREATMENT_STARTING_TOMORROW);
        this.alignerJourneyDetails = alignerJourneyDetails;
    }
}
