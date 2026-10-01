package com.dentalstack.patient.feature.patient.controller;

import com.dentalstack.patient.feature.appointment.exception.FailedToParseCreateAppointment;
import com.dentalstack.patient.feature.patient.dto.AddPatientCommentRequest;
import com.dentalstack.patient.feature.patient.dto.DeletePatientCommentRequest;
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
@RequestMapping("/patient/comment/v1/")
@RequiredArgsConstructor
public class PatientCommentsController {

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
        AddPatientCommentRequest request;
        try {
            request = mapper.readValue(reqStr, AddPatientCommentRequest.class);
        } catch (JsonProcessingException e) {
            throw new FailedToParseCreateAppointment(reqStr, e);
        }
        return ResponseEntity.ok(patientNotesService.addComment(request, files));
    }

    @DeleteMapping("/")
    @Operation(summary = "Delete a patient comment")
    public ResponseEntity<Void> deleteComment(@Valid @RequestBody DeletePatientCommentRequest request) {
        patientNotesService.deleteComment(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{patientId}")
    @Operation(summary = "Get all comment for a patient")
    public ResponseEntity<List<PatientCommentResponse>> getPatientComments(@PathVariable Long patientId) {
        List<PatientCommentResponse> comment = patientNotesService.getPatientComments(patientId);
        return ResponseEntity.ok(comment);
    }
}
