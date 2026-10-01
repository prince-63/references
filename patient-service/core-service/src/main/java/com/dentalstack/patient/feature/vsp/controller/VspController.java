package com.dentalstack.patient.feature.vsp.controller;

import com.dentalstack.patient.feature.patient.dto.PatientGetRequest;
import com.dentalstack.patient.feature.vsp.dto.request.*;
import com.dentalstack.patient.feature.vsp.dto.response.*;
import com.dentalstack.patient.feature.vsp.enums.VspOrderStatus;
import com.dentalstack.patient.feature.vsp.service.VspService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v1/vsp")
@RequiredArgsConstructor
public class VspController {

    private final VspService vspService;
    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @PostMapping("/orders")
    public ResponseEntity<VspOrderResponse> createOrder(@Valid @RequestBody CreateVspOrderRequest request) {

        return ResponseEntity.ok(vspService.createOrder(request));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<VspOrderResponse> getOrder(@PathVariable String orderId) {
        if ("null".equalsIgnoreCase(orderId)) {
            return ResponseEntity.ok(null);
        }
        return ResponseEntity.ok(vspService.getOrder(orderId));
    }

    @GetMapping("/orders/patient/{patientId}")
    public ResponseEntity<Page<VspOrderResponse>> getOrdersByPatient(
            @PathVariable Long patientId, @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(vspService.getOrdersByPatient(patientId, pageable));
    }

    @PutMapping("/orders")
    public ResponseEntity<VspOrderResponse> updateOrder(@Valid @RequestBody UpdateVspOrderRequest request) {
        return ResponseEntity.ok(vspService.updateOrder(request.getOrderId(), request));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<VspOrderResponse> updateOrderStatus(
            @PathVariable String orderId, @RequestParam VspOrderStatus status) {

        return ResponseEntity.ok(vspService.updateOrderStatus(orderId, status));
    }

    @PostMapping("/orders/case-records")
    public ResponseEntity<VspCaseRecordResponse> createCaseRecord(@Valid @RequestBody CreateCaseRecordRequest request) {
        return ResponseEntity.ok(vspService.createAndAttachCaseRecord(request.getOrderId(), request));
    }

    @GetMapping("/case-records/{caseRecordId}")
    public ResponseEntity<VspCaseRecordResponse> getCaseRecord(@PathVariable Long caseRecordId) {
        return ResponseEntity.ok(vspService.getCaseRecord(caseRecordId));
    }

    @PutMapping("/case-records")
    public ResponseEntity<VspCaseRecordResponse> updateCaseRecord(@Valid @RequestBody UpdateCaseRecordRequest request) {

        return ResponseEntity.ok(vspService.updateCaseRecord(request.getCaseRecordId(), request));
    }

    @GetMapping("/case-records/patient/{patientId}")
    public ResponseEntity<List<VspCaseRecordResponse>> getCaseRecordsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(vspService.getCaseRecordsByPatientId(patientId));
    }

    @GetMapping("/orders/{orderId}/case-records")
    public ResponseEntity<List<VspCaseRecordResponse>> getCaseRecordsByOrder(@PathVariable String orderId) {
        if ("null".equalsIgnoreCase(orderId)) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(vspService.getCaseRecordsByOrderId(orderId));
    }

    @GetMapping("/orders/{orderId}/status/get")
    public ResponseEntity<VspOrderStatusResponse> getOrderStatus(@PathVariable(required = false) String orderId) {
        if (orderId == null || "null".equalsIgnoreCase(orderId)) {
            return ResponseEntity.ok(
                    VspOrderStatusResponse.builder().orderStatus(null).build());
        }
        return ResponseEntity.ok(vspService.getOrderStatus(orderId));
    }

    @PostMapping("/orders/prescriptions")
    public ResponseEntity<VspPrescriptionResponse> createPrescription(
            @Valid @RequestBody CreatePrescriptionRequest request) {

        return ResponseEntity.ok(vspService.createAndAttachPrescription(request));
    }

    @GetMapping("/prescriptions/{prescriptionId}")
    public ResponseEntity<VspPrescriptionResponse> getPrescription(@PathVariable Long prescriptionId) {
        return ResponseEntity.ok(vspService.getPrescription(prescriptionId));
    }

    @PutMapping("/prescriptions")
    public ResponseEntity<VspPrescriptionResponse> updatePrescription(
            @Valid @RequestBody CreatePrescriptionRequest request) {

        return ResponseEntity.ok(vspService.updatePrescription(request));
    }

    @GetMapping("/prescriptions/patient/{patientId}")
    public ResponseEntity<List<VspPrescriptionResponse>> getPrescriptionsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(vspService.getPrescriptionsByPatientId(patientId));
    }

    @GetMapping("/orders/{orderId}/prescriptions")
    public ResponseEntity<List<VspPrescriptionResponse>> getPrescriptionsByOrder(@PathVariable String orderId) {
        if ("null".equalsIgnoreCase(orderId)) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(vspService.getPrescriptionsByOrderId(orderId));
    }

    @PostMapping("/treatment-plans")
    public ResponseEntity<VspTreatmentPlanResponse> createTreatmentPlan(
            @Valid @RequestBody CreateTreatmentPlanRequest request) {

        return ResponseEntity.ok(vspService.createTreatmentPlan(request));
    }

    @GetMapping("/orders/{orderId}/treatment-plans")
    public ResponseEntity<List<VspTreatmentPlanResponse>> getTreatmentPlansByOrder(@PathVariable String orderId) {
        if ("null".equalsIgnoreCase(orderId)) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(vspService.getTreatmentPlansByOrder(orderId));
    }

    @PutMapping("/treatment-plans")
    public ResponseEntity<VspTreatmentPlanResponse> updateTreatmentPlan(
            @Valid @RequestBody UpdateTreatmentPlanRequest request) {

        return ResponseEntity.ok(vspService.updateTreatmentPlan(request.getPlanId(), request));
    }

    @PostMapping("/treatment-plans/{planId}/submit")
    public ResponseEntity<VspTreatmentPlanResponse> submitTreatmentPlan(@PathVariable Long planId) {
        return ResponseEntity.ok(vspService.submitTreatmentPlanToDoctor(planId));
    }

    @DeleteMapping("/treatment-plans/{planId}")
    public ResponseEntity<Void> deleteTreatmentPlan(@PathVariable Long planId) {
        vspService.deleteTreatmentPlan(planId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/patient-details")
    @Operation(summary = "Get patient by doctor")
    public ResponseEntity<VspPatientDetailsV3> getPatientDetails(@Valid @RequestBody PatientGetRequest request) {
        return ResponseEntity.ok(vspService.getPatientDetailsV3(request));
    }

    @PostMapping("/mini-dashboard")
    public ResponseEntity<VspMiniDashboardDetailsResponse> getMiniDashboardDetails(
            @RequestBody VspMiniDashboardRequest request) {
        return ResponseEntity.ok(vspService.getMiniDashboardDetails(request));
    }
}
