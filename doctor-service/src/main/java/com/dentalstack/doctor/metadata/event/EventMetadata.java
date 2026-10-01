package com.dentalstack.doctor.metadata.event;

import com.dentalstack.doctor.dto.event.DoctorInvitationReceivedEventMetadata;
import com.dentalstack.doctor.dto.event.DoctorInvitationRejectedEventMetadata;
import com.dentalstack.doctor.dto.event.PracticeConnectedEventMetadata;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.AllArgsConstructor;
import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
        value = {
            @JsonSubTypes.Type(
                    value = DoctorInvitationReceivedEventMetadata.class,
                    name = "DOCTOR_INVITATION_RECEIVED"),
            @JsonSubTypes.Type(value = PracticeConnectedEventMetadata.class, name = "PRACTICE_CONNECTED_ORG"),
            @JsonSubTypes.Type(
                    value = DoctorInvitationRejectedEventMetadata.class,
                    name = "DOCTOR_INVITATION_REJECTED"),
        })
@AllArgsConstructor
@Data
public class EventMetadata {
    private final EventMetadataType type;
}
