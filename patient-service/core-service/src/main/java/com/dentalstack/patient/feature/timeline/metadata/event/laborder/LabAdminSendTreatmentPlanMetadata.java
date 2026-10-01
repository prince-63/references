package com.dentalstack.patient.feature.timeline.metadata.event.laborder;

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
public class LabAdminSendTreatmentPlanMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String labAdminDisplayName;
    private String orderId;

    @JsonCreator
    public LabAdminSendTreatmentPlanMetadata(String labAdminDisplayName, String orderId) {
        super(EventMetadataType.LAB_ADMIN_SEND_TREATMENT_PLAN);
        this.labAdminDisplayName = labAdminDisplayName;
        this.orderId = orderId;
    }
}
