package com.dentalstack.patient.feature.reminder.controller;

import com.dentalstack.patient.feature.reminder.dto.DeleteReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.SetCustomReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.UpdateReminderRequest;
import com.dentalstack.patient.feature.reminder.service.ReminderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Reminder api", description = "Reminder APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/reminder/v1")
@Slf4j
public class ReminderController {

    private final ReminderService reminderService;

    @PostMapping
    @Operation(summary = "Set a custom reminder")
    public void setCustomAppointmentReminder(@Valid @RequestBody SetCustomReminderRequest request) {
        reminderService.setReminder(request);
    }

    @PostMapping("/update")
    @Operation(summary = "Update reminder")
    public void updatePaymentReminder(@Valid @RequestBody UpdateReminderRequest request) {
        reminderService.updateReminder(request);
    }

    @PostMapping("/delete")
    @Operation(summary = "Delete reminder")
    public void deletePaymentReminder(@Valid @RequestBody DeleteReminderRequest request) {
        reminderService.deleteReminder(request);
    }
}
