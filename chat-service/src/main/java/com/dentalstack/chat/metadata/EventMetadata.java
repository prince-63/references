package com.dentalstack.chat.metadata;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.AllArgsConstructor;
import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
        value = {
            @JsonSubTypes.Type(value = MessageSentToDoctorEventMetadata.class, name = "MESSAGE_SENT_TO_DOCTOR"),
            @JsonSubTypes.Type(value = MessageSentToPatientEventMetadata.class, name = "MESSAGE_SENT_TO_PATIENT"),
            @JsonSubTypes.Type(value = ReminderSentToPatientEventMetadata.class, name = "REMINDER_SENT_TO_PATIENT"),
        })
@AllArgsConstructor
@Data
public class EventMetadata {
    private final EventMetadataType type;
}
