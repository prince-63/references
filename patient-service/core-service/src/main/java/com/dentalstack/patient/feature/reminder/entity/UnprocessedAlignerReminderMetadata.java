package com.dentalstack.patient.feature.reminder.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class UnprocessedAlignerReminderMetadata extends ReminderMetadata implements Serializable {
    private Long patientId;
    private Long treatmentPlanId;
    private String orderId;

    @JsonCreator
    public UnprocessedAlignerReminderMetadata(Long patientId, Long treatmentPlanId, String orderId) {
        super(ReminderMetadataType.UNPROCESSED_ALIGNER_REMINDER);
        this.patientId = patientId;
        this.treatmentPlanId = treatmentPlanId;
        this.orderId = orderId;
    }
}
