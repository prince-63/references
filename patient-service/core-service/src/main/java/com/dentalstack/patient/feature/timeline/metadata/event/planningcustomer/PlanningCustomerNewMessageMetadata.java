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
public class PlanningCustomerNewMessageMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private String patientName;
    private String practiceName;

    @JsonCreator
    public PlanningCustomerNewMessageMetadata(Long patientId, String patientName, String practiceName) {
        super(EventMetadataType.NEW_MESSAGE);
        this.patientId = patientId;
        this.patientName = patientName;
        this.practiceName = practiceName;
    }
}
