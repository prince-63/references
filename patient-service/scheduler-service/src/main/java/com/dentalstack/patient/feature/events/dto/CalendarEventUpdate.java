package com.dentalstack.patient.feature.events.dto;

import com.dentalstack.patient.feature.calendar.dto.CalendarResponseTypes;
import com.dentalstack.patient.feature.events.entity.Event;
import com.dentalstack.patient.feature.events.metadata.calendar.CalendarEventMetadata;
import com.dentalstack.patient.feature.patient.entity.Patient;
import java.io.Serializable;
import java.time.LocalDate;
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
public class CalendarEventUpdate extends Update implements Serializable {

    private long reminderId;
    private CalendarResponseTypes reminderType;
    private LocalDate reminderDate;

    public static CalendarEventUpdate from(Event event, Patient patient) {
        var metadata = (CalendarEventMetadata) event.getMetadata();
        return CalendarEventUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .reminderId(metadata.getReminderId())
                .reminderType(metadata.getReminderType())
                .reminderDate(metadata.getReminderDate())
                .build();
    }
}
