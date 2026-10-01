package com.dentalstack.patient.feature.payment.dto;

import com.dentalstack.patient.feature.reminder.entity.PaymentReminderMetadata;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentReminderDetails {
    private long reminderId;
    private LocalDate date;
    private ZoneId zone;
    private LocalTime time;
    private String note;
    private float amount;

    public static PaymentReminderDetails from(Reminder reminder) {
        var metadata = (PaymentReminderMetadata) reminder.getMetadata();

        return new PaymentReminderDetails(
                reminder.getId(),
                reminder.getDate(),
                reminder.getZone(),
                reminder.getTime(),
                metadata.getNotes(),
                metadata.getAmount());
    }
}
