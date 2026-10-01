package com.dentalstack.patient.feature.reminder.entity;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
        value = {
            @JsonSubTypes.Type(value = PushNotificationReminderChannelMetadata.class, name = "PUSH_NOTIFICATION"),
        })
@AllArgsConstructor
@Data
public abstract class ReminderChannelMetadata implements Serializable {
    private final ReminderChannelMetadataType type;

    public enum ReminderChannelMetadataType {
        PUSH_NOTIFICATION
    }
}
