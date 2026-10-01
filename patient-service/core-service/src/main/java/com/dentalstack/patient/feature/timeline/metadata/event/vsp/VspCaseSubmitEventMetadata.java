package com.dentalstack.patient.feature.timeline.metadata.event.vsp;

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
public class VspCaseSubmitEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private String patientName;
    private String orderId;
    private String labName;
    private String practiceName;

    @JsonCreator
    public VspCaseSubmitEventMetadata(
            Long patientId, String patientName, String orderId, String labName, String practiceName) {
        super(EventMetadataType.VSP_CASE_SUBMITTED);
        this.patientId = patientId;
        this.patientName = patientName;
        this.orderId = orderId;
        this.practiceName = practiceName;
        this.labName = labName;
    }
}
