package com.dentalstack.patient.feature.calendar.controller;

import com.dentalstack.patient.feature.calendar.dto.calendar.CalendarReminderResponse;
import com.dentalstack.patient.feature.calendar.dto.calendar.CalendarRequest;
import com.dentalstack.patient.feature.calendar.service.CalendarService;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Calendar api", description = "Calendar APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/calendar/v1")
@Slf4j
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/reminders")
    public List<CalendarReminderResponse> getCalendarReminders(
            @RequestParam("start_date") LocalDate startDate,
            @RequestParam("end_date") LocalDate endDate,
            @RequestParam("doctor_id") long doctorId) {

        CalendarRequest request = new CalendarRequest(startDate, endDate, doctorId, null, null);
        return calendarService.getCalendarReminders(request);
    }
}
