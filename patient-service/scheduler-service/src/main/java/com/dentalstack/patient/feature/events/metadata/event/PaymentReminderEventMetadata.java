package com.dentalstack.patient.feature.events.metadata.event;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class PaymentReminderEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;

    @Builder
    @JsonCreator
    public PaymentReminderEventMetadata(Long patientId) {
        super(EventMetadataType.PAYMENT_REMINDER);
        this.patientId = patientId;
    }
}
