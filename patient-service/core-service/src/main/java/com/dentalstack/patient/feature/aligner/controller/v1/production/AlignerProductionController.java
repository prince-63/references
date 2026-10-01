package com.dentalstack.patient.feature.aligner.controller.v1.production;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.AlignerProductionOrderUpdateLogsDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.UpdateAlignerProductionRequest;
import com.dentalstack.patient.feature.aligner.service.production.AlignerProductionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Aligner Production", description = "Aligner Production APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/aligner/production/v1")
public class AlignerProductionController {

    private final AlignerProductionService alignerProductionService;

    @PostMapping("/update")
    @Operation(summary = "Update the aligner production details")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> updateAlignerProduction(
            @Valid @RequestBody UpdateAlignerProductionRequest request) {
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerProductionService.updateAlignerProduction(request)));
    }

    @GetMapping("/update/logs/{aligner_journey_id}")
    @Operation(summary = "Get the production order update logs")
    public ResponseEntity<AlignerProductionOrderUpdateLogsDetails> getAlignerProductionOrderUpdateLogs(
            @PathVariable("aligner_journey_id") Long alignerJourneyId) {
        return ResponseEntity.ok(AlignerProductionOrderUpdateLogsDetails.from(
                alignerProductionService.getAlignerProductionOrderUpdateLogs(alignerJourneyId)));
    }
}
