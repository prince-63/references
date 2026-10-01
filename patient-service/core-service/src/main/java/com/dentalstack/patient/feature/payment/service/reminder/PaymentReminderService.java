package com.dentalstack.patient.feature.payment.service.reminder;

import com.dentalstack.patient.feature.payment.dto.UpdatePaymentReminderRequest;
import com.dentalstack.patient.feature.payment.dto.reminder.DeletePaymentReminderRequest;
import com.dentalstack.patient.feature.payment.dto.reminder.SetPaymentReminderRequest;
import com.dentalstack.patient.feature.treatment.entity.Treatment;

public interface PaymentReminderService {
    Treatment setReminder(SetPaymentReminderRequest request);

    Treatment deleteReminder(DeletePaymentReminderRequest request);

    Treatment updateReminder(UpdatePaymentReminderRequest request);
}
