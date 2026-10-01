package com.dentalstack.patient.feature.treatmenttracking.controller;

import com.dentalstack.patient.feature.treatmenttracking.dto.*;
import com.dentalstack.patient.feature.treatmenttracking.dto.ChangeAlignerRequest;
import com.dentalstack.patient.feature.treatmenttracking.service.AlignerTrackingPlanService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v1/tracking/treatment-plans")
@RequiredArgsConstructor
public class AlignerTrackingPlanController {

    private final AlignerTrackingPlanService treatmentPlanService;

    @PostMapping
    public ResponseEntity<TreatmentPlanResponse> createPlan(@RequestBody CreateTrackingTreatmentPlanRequest request) {

        return ResponseEntity.ok(treatmentPlanService.createTreatmentPlan(request));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<TreatmentPlanResponse>> getPlansForPatient(@PathVariable Long patientId) {

        return ResponseEntity.ok(treatmentPlanService.getPlansForPatient(patientId));
    }

    @GetMapping("/{planId}")
    public ResponseEntity<TreatmentPlanResponse> getPlan(@PathVariable Long planId) {

        return ResponseEntity.ok(treatmentPlanService.getPlanById(planId));
    }

    @PatchMapping("/{planId}/status")
    public ResponseEntity<TreatmentPlanResponse> updateStatus(
            @PathVariable Long planId, @RequestBody UpdateTreatmentPlanStatusRequest request) {

        return ResponseEntity.ok(treatmentPlanService.updatePlanStatus(planId, request));
    }

    @PostMapping("/{planId}/extend/current")
    public ResponseEntity<TreatmentPlanResponse> extendCurrent(
            @PathVariable Long planId,
            @RequestBody ExtendWearDaysRequest request,
            @AuthenticationPrincipal Long doctorId) {

        request.setTreatmentPlanId(planId);
        return ResponseEntity.ok(treatmentPlanService.extendCurrentAlignerWear(request, doctorId));
    }

    @PostMapping("/{planId}/extend/all")
    public ResponseEntity<TreatmentPlanResponse> extendAll(
            @PathVariable Long planId,
            @RequestBody ExtendWearDaysRequest request,
            @AuthenticationPrincipal Long doctorId) {

        request.setTreatmentPlanId(planId);
        return ResponseEntity.ok(treatmentPlanService.extendAllAlignersWear(request, doctorId));
    }

    @PostMapping("/{planId}/revert")
    public ResponseEntity<TreatmentPlanResponse> revert(
            @PathVariable Long planId,
            @RequestBody RevertWearDaysRequest request,
            @AuthenticationPrincipal Long doctorId) {

        request.setTreatmentPlanId(planId);
        return ResponseEntity.ok(treatmentPlanService.revertWearDays(request, doctorId));
    }

    @PostMapping("/{planId}/move-aligner")
    public ResponseEntity<TreatmentPlanResponse> moveAligner(
            @PathVariable Long planId,
            @RequestBody MoveAlignerRequest request,
            @AuthenticationPrincipal Long doctorId) {

        request.setTreatmentPlanId(planId);
        return ResponseEntity.ok(treatmentPlanService.moveToAligner(request, doctorId));
    }

    @PostMapping("/{planId}/change-aligner")
    public ResponseEntity<TreatmentPlanResponse> patientChangeAligner(
            @PathVariable Long planId,
            @RequestBody ChangeAlignerRequest request,
            @AuthenticationPrincipal Long patientUserId) {

        return ResponseEntity.ok(
                treatmentPlanService.patientChangeAligner(planId, request.getChangeDate(), patientUserId));
    }

    @PostMapping("/{planId}/check-in")
    public ResponseEntity<TreatmentPlanResponse> checkIn(
            @PathVariable Long planId,
            @RequestBody CheckInRequest request,
            @AuthenticationPrincipal Long patientUserId) {

        request.setTreatmentPlanId(planId);
        return ResponseEntity.ok(treatmentPlanService.checkIn(request, patientUserId));
    }

    @PostMapping("/{planId}/report-issue")
    public ResponseEntity<TreatmentPlanResponse> reportIssue(
            @PathVariable Long planId,
            @RequestBody ReportIssueRequest request,
            @AuthenticationPrincipal Long patientUserId) {

        request.setTreatmentPlanId(planId);
        return ResponseEntity.ok(treatmentPlanService.reportIssue(request, patientUserId));
    }
}
