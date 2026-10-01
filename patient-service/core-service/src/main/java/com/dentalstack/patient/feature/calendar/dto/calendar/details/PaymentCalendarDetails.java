package com.dentalstack.patient.feature.calendar.dto.calendar.details;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.reminder.entity.PaymentReminderMetadata;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentCalendarDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String notes;
    private String patientName;
    private String profileUrl;
    private long reminderId;
    private Float amount;
    private Long patientId;
    private LocalDate date;
    private LocalTime time;
    private String title;
    private Long alignerJourneyId;

    public static PaymentCalendarDetails from(
            String notes,
            String patientName,
            String profileUrl,
            Long reminderId,
            Float amount,
            Long patientId,
            LocalDate date,
            LocalTime time,
            String title) {
        return PaymentCalendarDetails.builder()
                .notes(notes)
                .patientName(patientName)
                .profileUrl(profileUrl)
                .reminderId(reminderId)
                .amount(amount)
                .patientId(patientId)
                .date(date)
                .time(time)
                .title(title)
                .build();
    }

    public static PaymentCalendarDetails from(
            String notes,
            String patientName,
            String profileUrl,
            Long reminderId,
            Float amount,
            Long patientId,
            LocalDate date,
            LocalTime time,
            String title,
            Long alignerJourneyId) {
        return PaymentCalendarDetails.builder()
                .notes(notes)
                .patientName(patientName)
                .profileUrl(profileUrl)
                .reminderId(reminderId)
                .amount(amount)
                .patientId(patientId)
                .date(date)
                .time(time)
                .title(title)
                .alignerJourneyId(alignerJourneyId)
                .build();
    }

    public static PaymentCalendarDetails from(Reminder reminder, Long alignerJourneyId) {
        if (reminder == null) {
            return null;
        }

        PaymentReminderMetadata paymentMetadata = (PaymentReminderMetadata) reminder.getMetadata();
        if (paymentMetadata == null || paymentMetadata.getPatientDetails() == null) {
            return null;
        }

        PatientDetails patientDetails = paymentMetadata.getPatientDetails();

        return PaymentCalendarDetails.from(
                paymentMetadata.getNotes(),
                patientDetails.getFullName(),
                patientDetails.getProfilePictureUrl(),
                reminder.getId(),
                paymentMetadata.getAmount(),
                patientDetails.getId(),
                reminder.getDate(),
                reminder.getTime(),
                reminder.getTitle(),
                alignerJourneyId);
    }
}
