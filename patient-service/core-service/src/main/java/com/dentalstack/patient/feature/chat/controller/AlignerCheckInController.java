package com.dentalstack.patient.feature.chat.controller;

import com.dentalstack.patient.feature.chat.dto.request.CreateAlignerCheckInRequest;
import com.dentalstack.patient.feature.chat.dto.response.AlignerCheckInResponse;
import com.dentalstack.patient.feature.chat.service.AlignerCheckInService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/patient/v1/aligner-check-ins")
@RequiredArgsConstructor
@Slf4j
public class AlignerCheckInController {

    private final AlignerCheckInService alignerCheckInService;
    private final ObjectMapper mapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create aligner check-in")
    public ResponseEntity<AlignerCheckInResponse> createCheckIn(
            @Parameter(
                            name = "createAlignerCheckInRequest",
                            example =
                                    """
                            {
                              "chatId": 1,
                              "patientId": 213,
                              "profileId": 49,
                              "doctorId": 49,
                              "alignerNumber": 5,
                              "startAlignerNumber": 1,
                              "endAlignerNumber": 10,
                              "totalAligners": 20,
                              "notes": "Patient is progressing well"
                            }
                            """)
                    @Valid
                    @RequestParam("createAlignerCheckInRequest")
                    String createAlignerCheckInRequest,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {

        CreateAlignerCheckInRequest request;
        try {
            request = mapper.readValue(createAlignerCheckInRequest, CreateAlignerCheckInRequest.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse aligner check-in request: " + e.getMessage(), e);
        }

        log.info("Creating aligner check-in for patient: {}", request.getPatientId());
        AlignerCheckInResponse response = alignerCheckInService.createCheckIn(request, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlignerCheckInResponse> getCheckInById(
            @PathVariable Long id, @RequestParam("profile_id") Long currentUserProfileId) {

        AlignerCheckInResponse response = alignerCheckInService.getCheckInById(id, currentUserProfileId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<AlignerCheckInResponse>> getCheckInsByPatient(
            @PathVariable Long patientId,
            @RequestParam("profile_id") Long currentUserProfileId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<AlignerCheckInResponse> response =
                alignerCheckInService.getCheckInsByPatient(patientId, currentUserProfileId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}/latest")
    public ResponseEntity<AlignerCheckInResponse> getLatestCheckIn(
            @PathVariable Long patientId, @RequestParam("profile_id") Long currentUserProfileId) {

        Optional<AlignerCheckInResponse> response =
                alignerCheckInService.getLatestCheckInByPatient(patientId, currentUserProfileId);

        return response.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}/max")
    public ResponseEntity<Integer> getMaxAlignerNumber(
            @PathVariable Long patientId, @RequestParam("profile_id") Long currentUserProfileId) {

        Integer maxNumber = alignerCheckInService.getMaxAlignerNumber(patientId, currentUserProfileId);
        return ResponseEntity.ok(maxNumber);
    }
}
