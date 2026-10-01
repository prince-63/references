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
public class ManufacturingCompletedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long patientId;
    private String patientName;
    private String orderId;
    private Long treatmentPlanId;

    @JsonCreator
    public ManufacturingCompletedEventMetadata(
            long patientId, String patientName, String orderId, Long treatmentPlanId) {
        super(EventMetadataType.MANUFACTURING_COMPLETED);
        this.patientId = patientId;
        this.patientName = patientName;
        this.orderId = orderId;
        this.treatmentPlanId = treatmentPlanId;
    }
}
