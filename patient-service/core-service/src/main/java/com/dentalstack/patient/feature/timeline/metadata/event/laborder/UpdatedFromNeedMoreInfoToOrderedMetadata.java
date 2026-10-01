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
public class UpdatedFromNeedMoreInfoToOrderedMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String orderId;

    @JsonCreator
    public UpdatedFromNeedMoreInfoToOrderedMetadata(String orderId) {
        super(EventMetadataType.UPDATED_FROM_NEED_MORE_INFO_TO_ORDERED);
        this.orderId = orderId;
    }
}
