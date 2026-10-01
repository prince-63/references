package com.dentalstack.patient.feature.payment.dto.reminder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeletePaymentReminderRequest {
    private long patientId;
    private long doctorId;
    private long reminderId;
}
