package com.dentalstack.patient.feature.events.metadata.event;

import com.dentalstack.patient.feature.treatment.dto.AlignerTreatmentResponse;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class TreatmentPlanAddedEventMetaData extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AlignerTreatmentResponse alignerTreatmentResponse;

    @JsonCreator
    public TreatmentPlanAddedEventMetaData(AlignerTreatmentResponse alignerTreatmentResponse) {
        super(EventMetadataType.TREATMENT_PLAN_ADDED);
        this.alignerTreatmentResponse = alignerTreatmentResponse;
    }
}
