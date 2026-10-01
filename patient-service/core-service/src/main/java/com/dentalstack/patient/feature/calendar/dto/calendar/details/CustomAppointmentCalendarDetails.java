package com.dentalstack.patient.feature.calendar.dto.calendar.details;

import com.dentalstack.patient.feature.reminder.entity.CustomAppointmentReminderMetadata;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import java.io.Serial;
import java.io.Serializable;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomAppointmentCalendarDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String notes;
    private String patientName;
    private String profileUrl;
    private String practiceLocationName;
    private String practiceLocationCity;
    private Long practiceLocationId;
    private String amount;
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;
    private long reminderId;
    private long patientId;
    private Long bracesJourneyId;
    private Boolean isBracesNotesAdded;
    private Long appointmentId;

    public static CustomAppointmentCalendarDetails from(
            String notes,
            String patientName,
            String profileUrl,
            ZonedDateTime startDate,
            ZonedDateTime endDate,
            long id,
            long patientId,
            Long practiceLocationId,
            String practiceLocationName,
            String practiceLocationCity,
            String amount,
            Long bracesJourneyId,
            Boolean isBracesNotesAdded,
            Long appointmentId) {
        return CustomAppointmentCalendarDetails.builder()
                .notes(notes)
                .patientName(patientName)
                .profileUrl(profileUrl)
                .endDate(endDate)
                .startDate(startDate)
                .reminderId(id)
                .patientId(patientId)
                .practiceLocationId(practiceLocationId)
                .practiceLocationName(practiceLocationName)
                .practiceLocationCity(practiceLocationCity)
                .amount(amount)
                .bracesJourneyId(bracesJourneyId)
                .isBracesNotesAdded(isBracesNotesAdded)
                .appointmentId(appointmentId)
                .build();
    }

    public static CustomAppointmentCalendarDetails from(Reminder reminder, Long bracesJourneyId) {
        var metadata = (CustomAppointmentReminderMetadata) reminder.getMetadata();
        return CustomAppointmentCalendarDetails.builder()
                .notes(metadata.getNotes())
                .patientName(metadata.getPatientDetails().getFullName())
                .profileUrl(metadata.getPatientDetails().getProfilePictureUrl())
                .endDate(metadata.getEndDate())
                .startDate(metadata.getStartDate())
                .reminderId(reminder.getId())
                .patientId(metadata.getPatientDetails().getId())
                .practiceLocationId(metadata.getPracticeLocationId())
                .practiceLocationName(metadata.getPracticeLocationName())
                .practiceLocationCity(metadata.getPracticeLocationCity())
                .amount(metadata.getAmount())
                .bracesJourneyId(bracesJourneyId)
                .isBracesNotesAdded(metadata.getIsBracesNotesAdded())
                .appointmentId(metadata.getAppointmentId())
                .build();
    }
}
