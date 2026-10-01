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
public class ThirdPartyCustomerSendCaseMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String customerDisplayName;
    private String orderId;

    @JsonCreator
    public ThirdPartyCustomerSendCaseMetadata(String customerDisplayName, String orderId) {
        super(EventMetadataType.THIRD_PARTY_CUSTOMER_SEND_CASE);
        this.customerDisplayName = customerDisplayName;
        this.orderId = orderId;
    }
}
