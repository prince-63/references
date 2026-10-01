package com.dentalstack.patient.feature.appointment.dto;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.AppointmentReminderEventMetadata;
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
public class AppointmentReminderUpdate extends Update implements Serializable {
    private Long patientId;

    public static AppointmentReminderUpdate from(Event event, Patient patient) {
        var metadata = (AppointmentReminderEventMetadata) event.getMetadata();
        return AppointmentReminderUpdate.builder()
                .eventId(event.getId())
                .patientId(metadata.getPatientId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .build();
    }
}
