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
public class ManufacturingInTransitEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long patientId;
    private String patientName;
    private Long treatmentPlanId;
    private String orderId;
    private String patientType;
    private Boolean hasReadExistingPatientForm;

    @JsonCreator
    public ManufacturingInTransitEventMetadata(
            long patientId,
            String patientName,
            Long treatmentPlanId,
            String orderId,
            String patientType,
            Boolean hasReadExistingPatientForm) {
        super(EventMetadataType.MANUFACTURING_IN_TRANSIT);
        this.patientId = patientId;
        this.patientName = patientName;
        this.treatmentPlanId = treatmentPlanId;
        this.orderId = orderId;
        this.patientType = patientType;
        this.hasReadExistingPatientForm = hasReadExistingPatientForm;
    }
}
