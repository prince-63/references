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
public class LabAdminSendStlFilesMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String labAdminDisplayName;
    private String orderId;
    private Long treatmentPlanId;

    @JsonCreator
    public LabAdminSendStlFilesMetadata(String labAdminDisplayName, String orderId, Long treatmentPlanId) {
        super(EventMetadataType.LAB_ADMIN_SEND_STL_FILES);
        this.orderId = orderId;
        this.labAdminDisplayName = labAdminDisplayName;
        this.treatmentPlanId = treatmentPlanId;
    }
}
