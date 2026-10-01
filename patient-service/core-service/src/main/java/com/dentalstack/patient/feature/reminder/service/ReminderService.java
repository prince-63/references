package com.dentalstack.patient.feature.reminder.service;

import com.dentalstack.patient.feature.reminder.dto.DeleteReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.SetCustomReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.UpdateReminderRequest;

public interface ReminderService {
    void setReminder(SetCustomReminderRequest request);

    void updateReminder(UpdateReminderRequest request);

    void deleteReminder(DeleteReminderRequest request);
}
