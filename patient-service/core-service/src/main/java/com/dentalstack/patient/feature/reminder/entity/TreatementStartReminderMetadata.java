package com.dentalstack.patient.feature.reminder.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class TreatementStartReminderMetadata extends ReminderMetadata implements Serializable {
    private Long patientId;

    @JsonCreator
    public TreatementStartReminderMetadata(Long patientId) {
        super(ReminderMetadataType.TREATMENT_START_REMINDER);
        this.patientId = patientId;
    }
}
