package com.dentalstack.patient.feature.smartbox.controller;

import com.dentalstack.patient.feature.smartbox.dto.SmartBoxRequest;
import com.dentalstack.patient.feature.smartbox.dto.SmartBoxResponse;
import com.dentalstack.patient.feature.smartbox.service.SmartBoxService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Smart box", description = "Smart box APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/smart/box/v1")
@Slf4j
public class SmartBoxController {

    private final SmartBoxService smartBoxService;

    @Operation(summary = "Get smart box status", description = "Get the status of smart box for a patient")
    @GetMapping
    public ResponseEntity<SmartBoxResponse> getSmartBoxStatus(@RequestParam("patient_id") String patientId) {
        try {
            SmartBoxResponse response = smartBoxService.getSmartBoxDetails(patientId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "Register smart box", description = "Register a new smart box for a patient")
    @PostMapping("/register")
    public ResponseEntity<SmartBoxResponse> registerSmartBox(@Valid @RequestBody SmartBoxRequest request) {

        try {
            SmartBoxResponse response = smartBoxService.registerSmartBox(request);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
