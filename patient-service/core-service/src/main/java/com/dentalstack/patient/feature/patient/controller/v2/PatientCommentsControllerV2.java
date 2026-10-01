package com.dentalstack.patient.feature.patient.controller.v2;

import com.dentalstack.patient.feature.appointment.exception.FailedToParseCreateAppointment;
import com.dentalstack.patient.feature.patient.dto.AddPatientCommentRequest;
import com.dentalstack.patient.feature.patient.dto.AddPatientCommentRequestV2;
import com.dentalstack.patient.feature.patient.dto.GetPatientCommentsByProfileRequest;
import com.dentalstack.patient.feature.patient.dto.PatientCommentResponse;
import com.dentalstack.patient.feature.patient.service.PatientCommentService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Patient Comments", description = "API for managing patient comments")
@RestController
@RequestMapping("/patient/comment/v2/")
@RequiredArgsConstructor
public class PatientCommentsControllerV2 {

    private final PatientCommentService patientNotesService;
    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @PostMapping(
            value = "/add",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Add patient comment with files")
    public ResponseEntity<PatientCommentResponse> addComment(
            @Valid @RequestParam("request") String reqStr,
            @Valid @RequestPart(value = "files", required = false) MultipartFile[] files) {
        new AddPatientCommentRequest();
        AddPatientCommentRequestV2 request;
        try {
            request = mapper.readValue(reqStr, AddPatientCommentRequestV2.class);
        } catch (JsonProcessingException e) {
            throw new FailedToParseCreateAppointment(reqStr, e);
        }
        return ResponseEntity.ok(patientNotesService.addCommentV2(request, files));
    }

    @PostMapping("/")
    public ResponseEntity<List<PatientCommentResponse>> getPatientCommentsByProfile(
            @Valid @RequestBody GetPatientCommentsByProfileRequest request) {
        List<PatientCommentResponse> responses = patientNotesService.getPatientCommentsByProfile(request);
        return ResponseEntity.ok(responses);
    }
}
