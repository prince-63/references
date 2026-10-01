package com.dentalstack.patient.feature.calendar.service;

import com.dentalstack.patient.feature.calendar.dto.calendar.CalendarReminderResponse;
import com.dentalstack.patient.feature.calendar.dto.calendar.CalendarRequest;
import java.util.List;

public interface CalendarService {
    List<CalendarReminderResponse> getCalendarReminders(CalendarRequest request);

    List<CalendarReminderResponse> getCalendarRemindersV3(CalendarRequest request);
}
