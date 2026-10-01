package com.dentalstack.patient.feature.caserecord.controller;

import com.dentalstack.patient.feature.caserecord.dto.CaseRecordDetails;
import com.dentalstack.patient.feature.caserecord.dto.CreateCaseRecordRequest;
import com.dentalstack.patient.feature.caserecord.dto.GetCaseRecordRequest;
import com.dentalstack.patient.feature.caserecord.service.CaseRecordService;
import com.dentalstack.patient.global.exception.FailedToParse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Case record", description = "Case record APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/case-record/v1")
public class CaseRecordController {

    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private final CaseRecordService caseRecordService;

    @PostMapping(
            value = "/create",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create a new case record")
    public ResponseEntity<CaseRecordDetails> createCaseRecord(
            @Parameter(
                            name = "Request body",
                            example =
                                    """
            {
              "chief_complaint": "Patient reports severe tooth pain in upper left molar",
              "case_record_name": "John Doe Initial Consultation",
              "patient_id": 35,
              "doctor_id": 315,
              "case_record_id": null,
              "profile_id": null,
              "order_id: null,
              "pre_treatment_file_ids": [],
              "scan_file_ids": [],
              "xray_file_ids": []
            }
        """)
                    @Valid
                    @RequestParam("details")
                    String reqStr,
            @RequestPart(value = "preTreatmentFiles", required = false) MultipartFile[] preTreatmentFiles,
            @RequestPart(value = "scanFiles", required = false) MultipartFile[] scanFiles,
            @RequestPart(value = "xRayFiles", required = false) MultipartFile[] xRayFiles) {
        CreateCaseRecordRequest request;
        try {
            request = mapper.readValue(reqStr, CreateCaseRecordRequest.class);
        } catch (JsonProcessingException e) {
            throw new FailedToParse(reqStr, e);
        }

        return ResponseEntity.ok(caseRecordService.createCaseRecord(request, preTreatmentFiles, scanFiles, xRayFiles));
    }

    @Operation(summary = "Get case record", description = "Get case record for an patient")
    @PostMapping("/")
    public ResponseEntity<CaseRecordDetails> getCaseRecordByPatientId(
            @Valid @RequestBody GetCaseRecordRequest request) {
        CaseRecordDetails response = caseRecordService.getCaseRecordByPatientId(request.getPatientId());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get All case records",
            description = "Get all case records for a patient, optionally filtered by order ID")
    @GetMapping("/all/{patientId}")
    public ResponseEntity<List<CaseRecordDetails>> getAllCaseRecords(
            @PathVariable Long patientId,
            @Parameter(description = "Optional Order ID to filter case records", example = "ORD-12345")
                    @RequestParam(required = false)
                    String orderId) {

        List<CaseRecordDetails> response = caseRecordService.getAllCaseRecords(patientId, orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/case-record/{caseRecordId}")
    @Operation(summary = "Get case record by ID", description = "Get case record by its ID")
    public ResponseEntity<CaseRecordDetails> getCaseRecordById(@PathVariable Long caseRecordId) {
        CaseRecordDetails response = caseRecordService.getCaseRecordById(caseRecordId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{caseRecordId}")
    @Operation(summary = "Delete case record", description = "Delete case record by its ID")
    public ResponseEntity<Void> deleteCaseRecord(@PathVariable Long caseRecordId) {
        caseRecordService.deleteCaseRecord(caseRecordId);
        return ResponseEntity.ok().build();
    }
}
