package com.dentalstack.patient.feature.gettingstarted.controller;

import com.dentalstack.patient.feature.gettingstarted.dto.GettingStartedDetailsRequest;
import com.dentalstack.patient.feature.gettingstarted.dto.GettingStartedResponse;
import com.dentalstack.patient.feature.gettingstarted.service.GettingStartedService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Getting started API", description = "Getting started APIs for patient overview")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/getting-started/v2")
@Slf4j
public class GettingStartedControllerV2 {
    private final GettingStartedService gettingStartedService;

    @Operation(
            summary = "Getting started details by filter",
            description = "Getting started details filtered by current step")
    @PostMapping("/details")
    public ResponseEntity<GettingStartedResponse> gettingStartedOverviewDetails(
            @Valid @RequestBody GettingStartedDetailsRequest request) {
        GettingStartedResponse response = gettingStartedService.gettingStartedOverviewDetails(request);
        return ResponseEntity.ok(response);
    }
}
