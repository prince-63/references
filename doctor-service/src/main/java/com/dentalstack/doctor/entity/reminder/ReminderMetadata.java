package com.dentalstack.doctor.entity.reminder;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@AllArgsConstructor
@NoArgsConstructor
@Data
public abstract class ReminderMetadata implements Serializable {
    private ReminderMetadataType type;

    public enum ReminderMetadataType {
        PAYMENTS_PENDING,
        UPCOMING_APPOINTMENT,
        PRODUCTION_ALIGNER_STATUS_PENDING,
        GENERAL_REMINDER,
        APPOINTMENT,
        APPOINTMENT_REMINDER
    }
}
