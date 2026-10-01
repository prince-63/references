package com.dentalstack.patient.feature.reminder.entity;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
        value = {
            @JsonSubTypes.Type(value = PaymentReminderMetadata.class, name = "PAYMENTS_PENDING"),
            @JsonSubTypes.Type(value = CustomAppointmentReminderMetadata.class, name = "APPOINTMENT"),
            @JsonSubTypes.Type(value = ProdutionReminderMetadata.class, name = "PRODUCTION_ALIGNER_STATUS_PENDING"),
            @JsonSubTypes.Type(value = GeneralReminderMetadata.class, name = "GENERAL_REMINDER"),
            @JsonSubTypes.Type(value = AppointmentReminderMetadata.class, name = "APPOINTMENT_REMINDER"),
        })
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
