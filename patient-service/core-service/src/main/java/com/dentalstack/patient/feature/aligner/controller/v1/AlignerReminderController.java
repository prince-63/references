package com.dentalstack.patient.feature.aligner.controller.v1;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.service.AlignerService;
import com.dentalstack.patient.feature.reminder.dto.*;
import com.dentalstack.patient.feature.reminder.service.SchedulingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Aligner reminders", description = "Aligner APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/aligner/v1/reminder")
public class AlignerReminderController {

    private final AlignerService alignerService;

    private final SchedulingService schedulingService;

    @PostMapping("/custom")
    @Operation(summary = "Set the reminder for aligner journey")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> setCustomReminder(@Valid @RequestBody SetReminderRequest request) {
        AlignerJourney alignerJourney = alignerService.setCustomReminder(request);
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @PostMapping("/default")
    @Operation(summary = "Set the default reminder for aligner journey")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> setDefaultReminder(
            @Valid @RequestBody SetDefaultReminderRequest request) {
        AlignerJourney alignerJourney = alignerService.setDefaultReminder(request);

        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @PatchMapping("/default")
    @Operation(summary = "Update the default reminder for aligner journey")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> updateDefaultReminder(
            @RequestBody UpdateDefaultReminderRequest request) {
        AlignerJourney alignerJourney = alignerService.updateDefaultReminder(request);
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @PatchMapping("/custom")
    @Operation(summary = "Update the custom reminder for aligner journey")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> updateCustomReminder(
            @RequestBody UpdateCustomReminderRequest request) {
        AlignerJourney alignerJourney = alignerService.updateCustomReminder(request);

        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @DeleteMapping("/default")
    @Operation(summary = "Delete the default reminder for aligner journey")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> deleteDefaultReminder(
            @RequestBody DeleteDefaultReminderRequest request) {
        AlignerJourney alignerJourney =
                alignerService.deleteDefaultReminder(request.getAlignerJourneyId(), request.getDefaultReminderId());

        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @DeleteMapping("/custom")
    @Operation(summary = "Delete the custom reminder for aligner journey")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> deleteCustomReminder(
            @RequestBody DeleteCustomReminderRequest request) {
        AlignerJourney alignerJourney =
                alignerService.deleteCustomReminder(request.getAlignerJourneyId(), request.getCustomReminderId());
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @PostMapping("/schedule/missed/job")
    @Operation(summary = "Schedule all the reminders if not already scheduled")
    public ResponseEntity<String> rescheduleMissingAlignerReminderJobs(@RequestParam(required = false) Long journeyId) {
        schedulingService.rescheduleMissingAlignerReminderJobs(journeyId);

        String message = journeyId != null
                ? "Successfully rescheduled missing reminders for aligner journey ID: " + journeyId
                : "Successfully rescheduled all missing reminders";

        return ResponseEntity.ok(message);
    }
}
