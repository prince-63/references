package com.dentalstack.patient.feature.aligner.controller.v1.production;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.reminder.AddAlignerProductionReminderRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.reminder.DeleteAlignerProductionReminderRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.reminder.UpdateAlignerProductionReminderRequest;
import com.dentalstack.patient.feature.aligner.service.production.AlignerProductionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Aligner Production", description = "Aligner Production APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/aligner/production/reminder/v1")
public class AlignerProductionReminderController {

    private final AlignerProductionService alignerProductionService;

    @PostMapping("/")
    @Operation(summary = "Add reminder for production order")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> addAlignerProductionOrderReminder(
            @RequestBody AddAlignerProductionReminderRequest request) {
        return ResponseEntity.ok(
                AlignerJourneyDetails.from(alignerProductionService.addAlignerProductionOrderReminder(request)));
    }

    @PostMapping("/delete")
    @Operation(summary = "Delete reminder for production order")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> deleteAlignerProductionOrderReminder(
            @RequestBody DeleteAlignerProductionReminderRequest request) {
        return ResponseEntity.ok(
                AlignerJourneyDetails.from(alignerProductionService.deleteAlignerProductionOrderReminder(request)));
    }

    @PostMapping("/update")
    @Operation(summary = "Update reminder for production order")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> updateAlignerProductionOrderReminder(
            @RequestBody UpdateAlignerProductionReminderRequest request) {
        return ResponseEntity.ok(
                AlignerJourneyDetails.from(alignerProductionService.updateAlignerProductionOrderReminder(request)));
    }
}
