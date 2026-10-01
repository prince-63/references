package com.dentalstack.patient.feature.appointment.dto.reminder;

import com.dentalstack.patient.feature.patient.projection.PatientSummary;
import com.dentalstack.patient.feature.reminder.entity.CustomAppointmentReminderMetadata;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomAppointmentReminderDetails {
    private Long patientId;
    private String notes;
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;
    private long reminderId;
    private Boolean isTrackingAdded;
    private Long bracesJourneyId;
    private BigDecimal amountDue;
    private Boolean isBracesNotesAdded;
    private String practiceLocationName;
    private String practiceLocationAddress;

    public static CustomAppointmentReminderDetails from(
            Reminder reminder,
            Long bracesJourneyId,
            PatientSummary patientSummary,
            Boolean isBracesNotesAdded,
            String practiceLocationName,
            String practiceLocationAddress) {
        CustomAppointmentReminderMetadata appointmentMetadata =
                (CustomAppointmentReminderMetadata) reminder.getMetadata();
        return CustomAppointmentReminderDetails.builder()
                .patientId(reminder.getAddedForUserId() != 0 ? reminder.getAddedForUserId() : null)
                .reminderId(reminder.getId())
                .startDate(appointmentMetadata.getStartDate())
                .endDate(appointmentMetadata.getEndDate())
                .notes(appointmentMetadata.getNotes())
                .isTrackingAdded(patientSummary.getIsTrackingAdded())
                .bracesJourneyId(bracesJourneyId)
                .amountDue(patientSummary.getAmountDue())
                .isBracesNotesAdded(isBracesNotesAdded)
                .practiceLocationName(practiceLocationName)
                .practiceLocationAddress(practiceLocationAddress)
                .build();
    }
}
