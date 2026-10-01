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
public class ThirdPartyCustomerRequestForStlFilesMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String customerDisplayName;
    private String orderId;
    private Long treatmentPlanId;

    @JsonCreator
    public ThirdPartyCustomerRequestForStlFilesMetadata(
            String customerDisplayName, String orderId, Long treatmentPlanId) {
        super(EventMetadataType.THIRD_PARTY_CUSTOMER_REQUEST_STL_FILES);
        this.customerDisplayName = customerDisplayName;
        this.orderId = orderId;
        this.treatmentPlanId = treatmentPlanId;
    }
}
