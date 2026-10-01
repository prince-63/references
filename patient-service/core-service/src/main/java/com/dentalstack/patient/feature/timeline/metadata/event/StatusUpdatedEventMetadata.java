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
public class StatusUpdatedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;

    @JsonCreator
    public StatusUpdatedEventMetadata(Long patientId) {
        super(EventMetadataType.STATUS_UPDATED);
        this.patientId = patientId;
    }
}
