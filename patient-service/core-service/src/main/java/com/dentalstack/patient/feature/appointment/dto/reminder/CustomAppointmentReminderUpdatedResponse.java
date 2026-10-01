package com.dentalstack.patient.feature.appointment.dto.reminder;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.CustomAppointmentReminderUpdatedEventMetadata;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CustomAppointmentReminderUpdatedResponse extends Update implements Serializable {
    private Long appointmentId;
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;
    private String amount;
    private Long bracesNotesId;
    private Long practiceLocationId;
    private String startTime;
    private String endTime;
    private String practiceLocationName;
    private String practiceLocationAddress;

    public static CustomAppointmentReminderUpdatedResponse from(Event event, Patient patient, Long reminderId) {
        var eventMetadata = (CustomAppointmentReminderUpdatedEventMetadata) event.getMetadata();
        if (eventMetadata == null) return null;

        return CustomAppointmentReminderUpdatedResponse.builder()
                .eventId(event.getId())
                .appointmentId(reminderId)
                .startDate(eventMetadata.getStartDate())
                .endDate(eventMetadata.getEndDate())
                .amount(eventMetadata.getAmount())
                .bracesNotesId(eventMetadata.getAppointmentId())
                .startTime(eventMetadata.getStartDate().toLocalTime().format(DateTimeFormatter.ofPattern("hh:mm a")))
                .endTime(eventMetadata.getEndDate().toLocalTime().format(DateTimeFormatter.ofPattern("hh:mm a")))
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientId(patient.getId())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .practiceLocationName(eventMetadata.getPracticeLocationName())
                .practiceLocationAddress(eventMetadata.getPracticeLocationAddress())
                .build();
    }
}
