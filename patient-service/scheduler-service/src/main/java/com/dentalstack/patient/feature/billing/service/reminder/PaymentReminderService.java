package com.dentalstack.patient.feature.billing.service.reminder;

import com.dentalstack.patient.feature.reminder.dto.DeletePaymentReminderRequest;
import com.dentalstack.patient.feature.treatment.entity.Treatment;

public interface PaymentReminderService {
    Treatment deleteReminder(DeletePaymentReminderRequest request);
}
