package com.dentalstack.patient.feature.calendar.controller;

import com.dentalstack.patient.feature.calendar.dto.calendar.CalendarReminderResponse;
import com.dentalstack.patient.feature.calendar.dto.calendar.CalendarRequest;
import com.dentalstack.patient.feature.calendar.service.CalendarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Calendar api v3", description = "Optimized Calendar APIs v3 with batch fetching and no N+1 queries")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/calendar/v3")
@Slf4j
public class CalendarControllerV3 {

    private final CalendarService calendarService;

    @Operation(summary = "Get calendar reminders")
    @PostMapping("/reminders")
    public List<CalendarReminderResponse> getCalendarReminders(@Valid @RequestBody CalendarRequest request) {
        return calendarService.getCalendarRemindersV3(request);
    }
}
