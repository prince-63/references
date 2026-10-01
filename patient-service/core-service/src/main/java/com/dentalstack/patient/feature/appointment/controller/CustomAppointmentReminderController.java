package com.dentalstack.patient.feature.appointment.controller;

import com.dentalstack.patient.feature.appointment.dto.reminder.*;
import com.dentalstack.patient.feature.appointment.dto.reminder.CustomAppointmentReminderDetails;
import com.dentalstack.patient.feature.appointment.dto.reminder.CustomAppointmentReminderResponse;
import com.dentalstack.patient.feature.appointment.dto.reminder.DeleteAppointmentReminderRequest;
import com.dentalstack.patient.feature.appointment.dto.reminder.SetAppointmentReminderRequest;
import com.dentalstack.patient.feature.appointment.dto.reminder.UpdateCustomAppointmentReminderRequest;
import com.dentalstack.patient.feature.appointment.enums.AppointmentReminderFilter;
import com.dentalstack.patient.feature.appointment.service.reminder.CustomAppointmentReminderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Custom Appointment Reminders", description = "Custom Appointment Reminders APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/custom/appointment/reminder/v1")
public class CustomAppointmentReminderController {

    private final CustomAppointmentReminderService customAppointmentReminderService;

    @PostMapping
    @Operation(summary = "Set a custom appointment reminder")
    public ResponseEntity<CustomAppointmentReminderDetails> setCustomAppointmentReminder(
            @Valid @RequestBody SetAppointmentReminderRequest request) {
        return ResponseEntity.ok(customAppointmentReminderService.setReminder(request));
    }

    @PostMapping("/update")
    @Operation(summary = "Update a payment reminder")
    public ResponseEntity<CustomAppointmentReminderDetails> updatePaymentReminder(
            @Valid @RequestBody UpdateCustomAppointmentReminderRequest request) {
        return ResponseEntity.ok(customAppointmentReminderService.updateReminder(request));
    }

    @PostMapping("/delete")
    @Operation(summary = "Delete a payment reminder")
    public void deletePaymentReminder(@Valid @RequestBody DeleteAppointmentReminderRequest request) {
        customAppointmentReminderService.deleteReminder(request);
    }

    @GetMapping("/appointments")
    @Operation(summary = "Get appointment reminders")
    public ResponseEntity<List<CustomAppointmentReminderResponse>> getAppointmentReminders(
            @RequestParam(value = "doctor_id", required = false) Long doctorId,
            @RequestParam(value = "patient_id", required = false) Long patientId,
            @RequestParam(value = "filter", defaultValue = "ALL") AppointmentReminderFilter filter) {
        return ResponseEntity.ok(customAppointmentReminderService.getReminders(patientId, doctorId, filter));
    }

    @GetMapping("/appointments/for-patients")
    @Operation(summary = "Get appointment reminders for patients")
    public ResponseEntity<List<CustomAppointmentReminderResponse>> getAppointmentRemindersForPatients(
            @RequestParam(value = "doctor_id", required = false) Long doctorId,
            @RequestParam(value = "patient_id", required = false) Long patientId,
            @RequestParam(value = "filter", defaultValue = "ALL") AppointmentReminderFilter filter) {
        return ResponseEntity.ok(customAppointmentReminderService.getRemindersForPatients(patientId, doctorId, filter));
    }
}
