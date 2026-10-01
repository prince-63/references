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
public class CaseAssignedToYouEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private String patientName;

    @JsonCreator
    public CaseAssignedToYouEventMetadata(Long patientId, String patientName) {
        super(EventMetadataType.CASE_ASSIGNED_TO_YOU);
        this.patientId = patientId;
        this.patientName = patientName;
    }
}
