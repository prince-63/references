package com.dentalstack.patient.feature.timeline.metadata.event.treatement;

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
public class TreatmentPlanFinalisedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long patientId;
    private String patientName;
    private String practiceName;
    private String orderId;
    private Long treatmentPlanId;

    @JsonCreator
    public TreatmentPlanFinalisedEventMetadata(
            long patientId, String patientName, String practiceName, String orderId, Long treatmentPlanId) {
        super(EventMetadataType.PLAN_FINALIZED_BY_PRACTICE);
        this.patientId = patientId;
        this.patientName = patientName;
        this.practiceName = practiceName;
        this.orderId = orderId;
        this.treatmentPlanId = treatmentPlanId;
    }
}
