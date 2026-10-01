package com.dentalstack.patient.feature.reminder.service;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.CustomAlignerReminder;
import com.dentalstack.patient.feature.aligner.entity.DefaultAlignerReminder;
import com.dentalstack.patient.feature.jobs.AlignerReminderInfo;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import jakarta.validation.constraints.NotNull;

public interface SchedulingService {

    void scheduleReminder(AlignerReminderInfo info);

    boolean reminderExists(DefaultAlignerReminder reminder);

    void scheduleDailyNotificationsCron();

    void scheduleDefaultReminderForCurrentAligner(DefaultAlignerReminder reminder);

    void scheduleDefaultReminder(DefaultAlignerReminder reminder, @NotNull Aligner currentAligner);

    void deleteCustomReminder(CustomAlignerReminder info);

    void deleteDefaultReminders(DefaultAlignerReminder reminder);

    void rescheduleMissingAlignerReminderJobs(Long reminderId);

    void scheduleDailyTenAMJob();

    void scheduleReminder(Reminder reminder);

    void deleteReminder(Reminder reminder);

    void scheduleDailyEventUpdatesCron();
}
