package com.dentalstack.patient.feature.timeline.metadata.event.planningcustomer;

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
public class PlanningCustomerPatientOnboardMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private String patientName;

    @JsonCreator
    public PlanningCustomerPatientOnboardMetadata(Long patientId, String patientName) {
        super(EventMetadataType.PLANNING_CUSTOMER_PATIENT_ONBOARDED);
        this.patientId = patientId;
        this.patientName = patientName;
    }
}
