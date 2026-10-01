package com.dentalstack.patient.feature.consent_template.controller;

import com.dentalstack.patient.feature.consent_template.dto.ConsentAcceptRequest;
import com.dentalstack.patient.feature.consent_template.dto.GetConsentAcceptedRecordsRequest;
import com.dentalstack.patient.feature.consent_template.dto.GetConsentAcceptedRecordsResponse;
import com.dentalstack.patient.feature.consent_template.service.ConsentAcceptedRecordService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Consent Accept Template API", description = "APIs for managing consent accepted records")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/consent-template/v1")
@Slf4j
public class ConsentAcceptedRecordController {

    private final ConsentAcceptedRecordService consentAcceptedRecordService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Operation(summary = "Accept a consent template")
    @PostMapping(
            value = "/accept",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public void consentAccept(@RequestParam("details") String details, @RequestPart("file") MultipartFile file) {
        ConsentAcceptRequest request;
        try {
            request = mapper.readValue(details, ConsentAcceptRequest.class);
        } catch (Exception e) {
            log.error("Error parsing consent accept request details", e);
            throw new RuntimeException("Invalid request details");
        }

        if (request.getToPatientId() != null) {
            consentAcceptedRecordService.patientConsentAccept(request, file);
        } else if (request.getToProfileId() != null) {
            consentAcceptedRecordService.customerConsentAccept(request, file);
        }
    }

    @Operation(summary = "Get accepted consent records")
    @PostMapping("/get/accepted/consents")
    public ResponseEntity<GetConsentAcceptedRecordsResponse> getAcceptedRecords(
            @RequestBody GetConsentAcceptedRecordsRequest request) {
        if (request.getToProfileId() != null) {
            return ResponseEntity.ok(consentAcceptedRecordService.getConsentsAcceptedForCustomer(request));
        } else if (request.getToPatientId() != null) {
            return ResponseEntity.ok(consentAcceptedRecordService.getConsentsAcceptedForPatient(request));
        }
        return ResponseEntity.ok(null);
    }
}
