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
public class OrgRequestedNeedMoreInfoMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String orderId;

    @JsonCreator
    public OrgRequestedNeedMoreInfoMetadata(String orderId) {
        super(EventMetadataType.NEED_MORE_INFO_REQUESTED);
        this.orderId = orderId;
    }
}
