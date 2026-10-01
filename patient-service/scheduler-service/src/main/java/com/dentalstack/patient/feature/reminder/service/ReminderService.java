package com.dentalstack.patient.feature.reminder.service;

import com.dentalstack.patient.feature.reminder.dto.SetCustomReminderRequest;

public interface ReminderService {
    void setReminder(SetCustomReminderRequest request);
}
