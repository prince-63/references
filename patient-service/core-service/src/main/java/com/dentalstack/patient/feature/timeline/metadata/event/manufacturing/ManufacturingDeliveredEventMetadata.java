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
public class ManufacturingDeliveredEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long patientId;
    private String patientName;
    private String orderId;
    private Long treatmentPlanId;
    private String patientType;
    private Boolean hasReadExistingPatientForm;

    @JsonCreator
    public ManufacturingDeliveredEventMetadata(
            long patientId,
            String patientName,
            String orderId,
            Long treatmentPlanId,
            String patientType,
            Boolean hasReadExistingPatientForm) {
        super(EventMetadataType.MANUFACTURING_DELIVERED);
        this.patientId = patientId;
        this.patientName = patientName;
        this.orderId = orderId;
        this.treatmentPlanId = treatmentPlanId;
        this.patientType = patientType;
        this.hasReadExistingPatientForm = hasReadExistingPatientForm;
    }
}
