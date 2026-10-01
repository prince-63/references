package com.dentalstack.patient.feature.treatment.controller;

import com.dentalstack.patient.feature.aligner.dto.alignertreatment.AlignerTreatmentResponse;
import com.dentalstack.patient.feature.order.dto.ShippingDetailsResponse;
import com.dentalstack.patient.feature.patient.dto.TreatmentPlanRequest;
import com.dentalstack.patient.feature.treatment.dto.*;
import com.dentalstack.patient.feature.treatment.exception.FailedToParseCreateTreatmentPlan;
import com.dentalstack.patient.feature.treatment.service.TreatmentService;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/leads/treatment/v1")
@Tag(name = "Treatment", description = "Treatment Plan APIs")
public class TreatmentController {

    private final TreatmentService treatmentService;
    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @GetMapping("/plan/{aligner_treatment_id}")
    @Operation(summary = "Get the aligner treatment plan by ")
    public ResponseEntity<AlignerTreatmentResponse> getTreatmentPlan(
            @PathVariable("aligner_treatment_id") Long alignerTreatmentId) {
        return ResponseEntity.ok(treatmentService.getTreatmentPlan(alignerTreatmentId));
    }

    @PostMapping(
            value = "/plan",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Add or update the treatment")
    public ResponseEntity<AlignerTreatmentResponse> createOrUpdateTreatmentPlan(
            @Valid @RequestParam("details") String reqStr,
            @Valid @RequestPart(value = "file", required = false) MultipartFile[] file,
            @Valid @RequestPart(value = "pdfFile", required = false) MultipartFile[] pdfFile,
            @Valid @RequestPart(value = "otherFile", required = false) MultipartFile[] otherFile,
            @Valid @RequestPart(value = "LEFT", required = false) MultipartFile leftVideo,
            @Valid @RequestPart(value = "RIGHT", required = false) MultipartFile rightVideo,
            @Valid @RequestPart(value = "TOP", required = false) MultipartFile topVideo,
            @Valid @RequestPart(value = "BOTTOM", required = false) MultipartFile bottomVideo,
            @Valid @RequestPart(value = "FRONT", required = false) MultipartFile frontVideo,
            @Valid @RequestPart(value = "SINGLE_VIDEO", required = false) MultipartFile singleVideo) {
        new TreatmentPlanRequest();
        TreatmentPlanRequest request;
        try {
            request = mapper.readValue(reqStr, TreatmentPlanRequest.class);
        } catch (JsonProcessingException e) {
            throw new FailedToParseCreateTreatmentPlan(reqStr, e);
        }
        return ResponseEntity.ok(treatmentService.createOrUpdateTreatmentPlan(
                request,
                file,
                pdfFile,
                otherFile,
                leftVideo,
                rightVideo,
                topVideo,
                bottomVideo,
                frontVideo,
                singleVideo));
    }

    @GetMapping("/plan")
    @Operation(summary = "Get treatment plan")
    public ResponseEntity<?> getTreatmentPlan(
            @RequestParam(value = "patient_id") Long patientId,
            @RequestParam(value = "doctor_id") Long doctorId,
            @RequestParam(value = "organization_id", required = false) Long organizationId,
            @RequestParam(value = "order_id", required = false) String orderId,
            @RequestParam(value = "treatment_subtype") ProductTypeName treatmentSubtype) {
        return ResponseEntity.ok(
                treatmentService.getTreatmentPlan(patientId, doctorId, orderId, organizationId, treatmentSubtype));
    }

    @Operation(summary = "Attach shipping details", description = "Attach shipping details to treatment plan")
    @PostMapping("/attach-shipping")
    public ResponseEntity<ShippingDetailsResponse> attachShippingToTreatment(
            @Valid @RequestBody AttachShippingToTreatment request) {
        ShippingDetailsResponse response = treatmentService.attachShippingToTreatment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/plan/workflow")
    @Operation(summary = "Get treatment plan for workflow")
    public ResponseEntity<TreatmentPlanWorkflowResponse> getTreatmentPlan(
            @RequestBody TreatmentPlanForWorkflowRequest request) {
        return ResponseEntity.ok(treatmentService.getTreatmentPlanForWorkflow(request));
    }

    @DeleteMapping("/plan/delete")
    @Operation(summary = "Delete treatment plan by id")
    public void deleteTreatmentPlan(@RequestParam Long profileId, @RequestParam Long treatmentPlanId) {
        treatmentService.deleteTreatmentPlan(profileId, treatmentPlanId);
    }

    @PostMapping("/")
    public ResponseEntity<?> addOrUpdateTreatment(@RequestBody AddTreatmentRequest addTreatmentRequest) {
        treatmentService.addTreatment(addTreatmentRequest);
        return ResponseEntity.ok("Success");
    }

    @GetMapping("/braces-aligner")
    @Operation(summary = "Get braces and aligner treatment plan list")
    public ResponseEntity<List<BracesAlignerTreatmentResponse>> getBracesAndAlignerTreatmentPlanList(
            @RequestParam(value = "patient_id") Long patientId,
            @RequestParam(value = "doctor_id") Long doctorId,
            @RequestParam(value = "organization_id", required = false) Long organizationId,
            @RequestParam(value = "order_id", required = false) String orderId) {
        return ResponseEntity.ok(
                treatmentService.getBracesAndAlignerTreatmentPlanList(patientId, doctorId, orderId, organizationId));
    }

    @GetMapping("/details")
    @Operation(summary = "Get treatment plan list")
    public ResponseEntity<PatientAlignerTreatmentResponse> getPatientTreatmentDetails(
            @RequestParam(value = "patient_id") Long patientId, @RequestParam(value = "doctor_id") Long doctorId) {
        return ResponseEntity.ok(treatmentService.getPatientAlignerTreatment(patientId, doctorId));
    }

    @PostMapping("/approved-plan-by-patient")
    @Operation(summary = "Update treatment plan approved by patient")
    public ResponseEntity<AlignerTreatmentResponse> approvedPlanByPatient(
            @RequestParam Long treatmentPlanId,
            @RequestParam Long patientId,
            @RequestParam Boolean isApprovedByPatient,
            @RequestParam LocalDate approvedByPatientAt) {
        if (treatmentPlanId == null || patientId == null) {
            throw new IllegalArgumentException("treatmentPlanId and patientId must not be null");
        }
        return ResponseEntity.ok(treatmentService.approvedPlanByPatient(
                treatmentPlanId, patientId, isApprovedByPatient, approvedByPatientAt));
    }

    @PostMapping("/complete-treatment")
    @Operation(summary = "Complete treatment plan")
    public ResponseEntity<String> completeTreatment(@RequestBody CompleteTreatmentPlanRequest request) {
        if (request.getTreatmentPlanId() == null
                || request.getTreatmentCompletedRemarks().isEmpty()) {
            throw new IllegalArgumentException("treatmentPlanId and patientId must not be null");
        }

        treatmentService.completeTreatmentPlan(request);
        return ResponseEntity.ok("TreatmentPlan marked successfully completed!");
    }
}
