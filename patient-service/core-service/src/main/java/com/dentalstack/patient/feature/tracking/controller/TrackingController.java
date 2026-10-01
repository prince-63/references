package com.dentalstack.patient.feature.tracking.controller;

import com.dentalstack.patient.feature.tracking.dto.StlFileToggleRequest;
import com.dentalstack.patient.feature.tracking.service.TrackingService;
import com.dentalstack.patient.global.enums.ProductTypeName;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Tracking", description = "Treatment Tracking APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/leads/tracking/v1")
public class TrackingController {

    private final TrackingService trackingService;

    @GetMapping
    public ResponseEntity<?> getTrackingDetailsForPatient(
            @RequestParam(value = "doctor_id") Long doctorId,
            @RequestParam(value = "patient_id") Long patientId,
            @RequestParam(value = "treatment_subtype") ProductTypeName treatmentSubtype) {
        return ResponseEntity.ok(trackingService.getTracking(doctorId, patientId, treatmentSubtype));
    }

    @PostMapping("/toggle-is-tracking/{profileId}")
    public ResponseEntity<Void> toggleTracking(@PathVariable Long profileId) {
        trackingService.toggleIsTrackingForCustomer(profileId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/toggle-details")
    public void toogleDetails(@RequestBody StlFileToggleRequest request) {
        trackingService.toggleDetails(request);
    }
}
