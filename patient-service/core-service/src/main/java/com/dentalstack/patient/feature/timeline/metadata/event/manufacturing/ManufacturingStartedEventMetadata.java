package com.dentalstack.patient.feature.timeline.metadata.event.manufacturing;

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
public class ManufacturingStartedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long patientId;
    private String patientName;
    private String orderId;
    private Long treatmentPlanId;

    @JsonCreator
    public ManufacturingStartedEventMetadata(long patientId, String patientName, String orderId, Long treatmentPlanId) {
        super(EventMetadataType.MANUFACTURING_STARTED);
        this.patientId = patientId;
        this.treatmentPlanId = treatmentPlanId;
        this.orderId = orderId;
        this.patientName = patientName;
    }
}
