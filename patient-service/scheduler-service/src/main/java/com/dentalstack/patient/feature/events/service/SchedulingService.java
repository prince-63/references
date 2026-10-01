package com.dentalstack.patient.feature.events.service;

import com.dentalstack.patient.feature.crons.jobs.AlignerReminderInfo;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.treatment.entity.Aligner;
import com.dentalstack.patient.feature.treatment.entity.CustomAlignerReminder;
import com.dentalstack.patient.feature.treatment.entity.DefaultAlignerReminder;
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
