package com.dentalstack.patient.feature.timeline.metadata.event.erp;

import com.dentalstack.patient.feature.timeline.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.EventMetadataType;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class PracticeConnectedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String practiceName;
    private String doctorRole;

    @JsonCreator
    public PracticeConnectedEventMetadata(String practiceName, String doctorRole) {
        super(EventMetadataType.PRACTICE_CONNECTED_ORG);
        this.practiceName = practiceName;
        this.doctorRole = doctorRole;
    }
}
