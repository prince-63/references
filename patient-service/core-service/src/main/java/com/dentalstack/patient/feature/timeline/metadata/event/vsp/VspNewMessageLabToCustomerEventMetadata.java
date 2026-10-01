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
public class VspNewMessageLabToCustomerEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private String patientName;
    private String orgName;
    private String labName;
    private String practiceName;

    @JsonCreator
    public VspNewMessageLabToCustomerEventMetadata(
            Long patientId, String patientName, String orgName, String labName, String practiceName) {
        super(EventMetadataType.VSP_NEW_MESSAGE_LAB_TO_CUSTOMER);
        this.patientId = patientId;
        this.patientName = patientName;
        this.orgName = orgName;
        this.labName = labName;
        this.practiceName = practiceName;
    }
}
