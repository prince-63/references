package com.dentalstack.patient.feature.appointment.controller;

import com.dentalstack.patient.feature.appointment.dto.AddAppointmentReminderRequest;
import com.dentalstack.patient.feature.appointment.dto.AppointmentReminderDetails;
import com.dentalstack.patient.feature.appointment.service.reminder.AppointmentReminderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Appointment Reminder", description = "Appointment Reminder APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/appointment/reminder/v1")
public class AppointmentReminderController {

    private final AppointmentReminderService appointmentReminderService;

    @PostMapping("/")
    @Operation(summary = "Add reminder for appointment")
    public ResponseEntity<String> addAppointmentReminder(@RequestBody AddAppointmentReminderRequest request) {
        appointmentReminderService.addReminder(request);
        return ResponseEntity.ok("Reminder added successfully");
    }

    @PostMapping("/delete/{reminder_id}")
    @Operation(summary = "Delete reminder for appointment")
    public ResponseEntity<String> deleteAppointmentReminder(@PathVariable("reminder_id") Long reminderId) {
        appointmentReminderService.deleteReminder(reminderId);
        return ResponseEntity.ok("Reminder deleted successfully");
    }

    @GetMapping("/")
    @Operation(summary = "Get appointment reminders")
    public ResponseEntity<List<AppointmentReminderDetails>> getAppointmentReminder(
            @RequestParam(value = "doctor_id", required = false) Long doctorId,
            @RequestParam(value = "patient_id", required = false) Long patientId) {
        return ResponseEntity.ok(appointmentReminderService.getReminders(patientId, doctorId));
    }
}
