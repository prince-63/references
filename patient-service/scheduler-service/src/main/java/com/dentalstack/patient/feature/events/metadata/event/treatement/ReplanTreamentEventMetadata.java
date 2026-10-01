package com.dentalstack.patient.feature.events.metadata.event.treatement;

import com.dentalstack.patient.feature.events.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.EventMetadataType;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class ReplanTreamentEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long patientId;
    private String patientName;
    private String practiceName;
    private String orderId;

    @JsonCreator
    public ReplanTreamentEventMetadata(long patientId, String patientName, String practiceName, String orderId) {
        super(EventMetadataType.RE_PLAN_TREATMENT);
        this.patientId = patientId;
        this.patientName = patientName;
        this.practiceName = practiceName;
        this.orderId = orderId;
    }
}
