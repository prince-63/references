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
public class CaseMovedToProductionEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private String patientName;

    @JsonCreator
    public CaseMovedToProductionEventMetadata(Long patientId, String patientName) {
        super(EventMetadataType.CASE_MOVED_TO_PRODUCTION);
        this.patientId = patientId;
        this.patientName = patientName;
    }
}
