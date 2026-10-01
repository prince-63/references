package com.dentalstack.patient.feature.notification.dto;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.MessageSentToPatientEventMetadata;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class MessageSentToPatientUpdate extends Update implements Serializable {
    private PatientDetails patientDetails;
    private Long doctorId;

    public static MessageSentToPatientUpdate from(Event event) {
        var metadata = (MessageSentToPatientEventMetadata) event.getMetadata();
        var patient = metadata.getPatientDetails();
        return MessageSentToPatientUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .patientDetails(metadata.getPatientDetails())
                .build();
    }
}
