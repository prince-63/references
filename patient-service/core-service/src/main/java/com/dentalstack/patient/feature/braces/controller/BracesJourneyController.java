package com.dentalstack.patient.feature.braces.controller;

import com.dentalstack.patient.feature.braces.dto.BracesJourneyDetails;
import com.dentalstack.patient.feature.braces.dto.CreateBracesJourneyRequest;
import com.dentalstack.patient.feature.braces.dto.FilterBracesJourneysRequest;
import com.dentalstack.patient.feature.braces.dto.UpdateBracesJourneyRequest;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.braces.service.BracesJourneyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Braces", description = "Braces APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/braces/v1")
@Slf4j
public class BracesJourneyController {

    private final BracesJourneyService bracesService;

    @PostMapping
    @Operation(summary = "Create braces journey for the patient")
    public ResponseEntity<BracesJourneyDetails> createBracesJourney(
            @Valid @RequestBody CreateBracesJourneyRequest request) {
        return ResponseEntity.ok(bracesService.createBracesJourney(request));
    }

    @PostMapping("/update")
    @Operation(summary = "Update the braces journey")
    public ResponseEntity<BracesJourneyDetails> updateAlignerJourney(
            @Valid @RequestBody UpdateBracesJourneyRequest request) {
        return ResponseEntity.ok(bracesService.updateBracesJourney(request));
    }

    @GetMapping("/")
    @Operation(summary = "Get the Braces journey of the patient only with appointments")
    @Deprecated
    public ResponseEntity<List<BracesJourneyDetails>> getBracesJourneysForWeb(
            @RequestParam Long doctorId,
            @RequestParam(required = false) Long bracesJourneyId,
            @RequestParam(required = false) BracesTreatmentStage status) {
        List<BracesJourneyDetails> bracesJourneyDetails;
        if (bracesJourneyId != null) {
            bracesJourneyDetails = bracesService.getBracesJourney(bracesJourneyId);
        } else {
            bracesJourneyDetails = bracesService.getBracesJourneyDetailsForWeb(doctorId, status);
        }
        return ResponseEntity.ok(bracesJourneyDetails);
    }

    @PostMapping("/filter")
    @Operation(summary = "Get the filtered the braces journeys")
    public ResponseEntity<List<BracesJourneyDetails>> getFilteredBracesJourneys(
            @Valid @RequestBody FilterBracesJourneysRequest request) {
        return ResponseEntity.ok(bracesService.getFilteredBracesJourneys(request));
    }
}
