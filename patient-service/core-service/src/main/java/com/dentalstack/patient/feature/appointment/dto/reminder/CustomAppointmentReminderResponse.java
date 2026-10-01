package com.dentalstack.patient.feature.appointment.dto.reminder;

import com.dentalstack.patient.feature.reminder.entity.CustomAppointmentReminderMetadata;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.timeline.metadata.event.CustomAppointmentReminderAddedEventMetadata;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomAppointmentReminderResponse {
    private Long appointmentId;
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;
    private String notes;
    private String amount;
    private Long bracesJourneyId;
    private boolean isBracesNotesAdded;
    private Long bracesNotesId;
    private Long practiceLocationId;
    private String startTime;
    private String endTime;
    private String practiceLocationName;
    private String practiceLocationAddress;

    public static CustomAppointmentReminderResponse from(Reminder reminder, Long bracesJourneyId) {

        var metadata = (CustomAppointmentReminderMetadata) reminder.getMetadata();
        return CustomAppointmentReminderResponse.builder()
                .appointmentId(reminder.getId())
                .startDate(metadata.getStartDate())
                .endDate(metadata.getEndDate())
                .notes(metadata.getNotes())
                .amount(metadata.getAmount())
                .bracesJourneyId(bracesJourneyId)
                .isBracesNotesAdded(metadata.getIsBracesNotesAdded())
                .bracesNotesId(metadata.getAppointmentId())
                .practiceLocationId(metadata.getPracticeLocationId())
                .practiceLocationName(metadata.getPracticeLocationName())
                .practiceLocationAddress(metadata.getPracticeLocationAddress())
                .build();
    }

    public static CustomAppointmentReminderResponse from(
            Reminder reminder, Long bracesJourneyId, String practiceLocationName, String practiceLocationAddress) {

        var metadata = (CustomAppointmentReminderMetadata) reminder.getMetadata();
        return CustomAppointmentReminderResponse.builder()
                .appointmentId(reminder.getId())
                .startDate(metadata.getStartDate())
                .endDate(metadata.getEndDate())
                .notes(metadata.getNotes())
                .amount(metadata.getAmount())
                .bracesJourneyId(bracesJourneyId)
                .isBracesNotesAdded(metadata.getIsBracesNotesAdded())
                .bracesNotesId(metadata.getAppointmentId())
                .startTime(metadata.getStartDate().toLocalTime().format(DateTimeFormatter.ofPattern("hh:mm a")))
                .endTime(metadata.getEndDate().toLocalTime().format(DateTimeFormatter.ofPattern("hh:mm a")))
                .practiceLocationId(metadata.getPracticeLocationId())
                .practiceLocationName(practiceLocationName)
                .practiceLocationAddress(practiceLocationAddress)
                .build();
    }

    public static CustomAppointmentReminderResponse from(
            CustomAppointmentReminderAddedEventMetadata eventMetadata, Long reminderId) {
        if (eventMetadata == null) return null;

        return CustomAppointmentReminderResponse.builder()
                .appointmentId(reminderId)
                .startDate(eventMetadata.getStartDate())
                .endDate(eventMetadata.getEndDate())
                .amount(eventMetadata.getAmount())
                .bracesNotesId(eventMetadata.getAppointmentId())
                .startTime(eventMetadata.getStartDate().toLocalTime().format(DateTimeFormatter.ofPattern("hh:mm a")))
                .endTime(eventMetadata.getEndDate().toLocalTime().format(DateTimeFormatter.ofPattern("hh:mm a")))
                .build();
    }
}
