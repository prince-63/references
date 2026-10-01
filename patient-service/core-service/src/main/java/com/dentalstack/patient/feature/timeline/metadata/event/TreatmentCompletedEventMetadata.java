package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.treatment.dto.TreatmentCompleted;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class TreatmentCompletedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private TreatmentCompleted treatmentCompleted;

    @JsonCreator
    public TreatmentCompletedEventMetadata(TreatmentCompleted treatmentCompleted) {
        super(EventMetadataType.TREATMENT_COMPLETED);
        this.treatmentCompleted = treatmentCompleted;
    }
}
