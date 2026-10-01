package com.dentalstack.patient.feature.timeline.metadata.event.order;

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
public class CommentAddedOnOrderEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long patientId;
    private String patientName;
    private String orgName;
    private String orderId;

    @JsonCreator
    public CommentAddedOnOrderEventMetadata(long patientId, String patientName, String orgName, String orderId) {
        super(EventMetadataType.COMMENT_ADDED_ON_ORDER);
        this.patientId = patientId;
        this.patientName = patientName;
        this.orgName = orgName;
        this.orderId = orderId;
    }
}
