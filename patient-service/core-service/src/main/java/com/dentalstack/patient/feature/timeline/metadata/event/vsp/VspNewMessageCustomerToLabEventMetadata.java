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
public class VspNewMessageCustomerToLabEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private String patientName;
    private String customerName;
    private String labName;
    private String practiceName;

    @JsonCreator
    public VspNewMessageCustomerToLabEventMetadata(
            Long patientId, String patientName, String customerName, String labName, String practiceName) {
        super(EventMetadataType.VSP_NEW_MESSAGE_CUSTOMER_TO_LAB);
        this.patientId = patientId;
        this.patientName = patientName;
        this.customerName = customerName;
        this.practiceName = practiceName;
        this.labName = labName;
    }
}
