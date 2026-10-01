package com.dentalstack.patient.feature.calendar.controller;

import com.dentalstack.patient.feature.calendar.dto.calendar.CalendarReminderResponse;
import com.dentalstack.patient.feature.calendar.dto.calendar.CalendarRequest;
import com.dentalstack.patient.feature.calendar.service.CalendarService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Calendar api v2", description = "Calendar APIs v2")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/calendar/v2")
@Slf4j
public class CalendarControllerV2 {

    private final CalendarService calendarService;

    @PostMapping("/reminders")
    public List<CalendarReminderResponse> getCalendarReminders(@Valid @RequestBody CalendarRequest request) {
        return calendarService.getCalendarReminders(request);
    }
}
