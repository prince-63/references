package com.dentalstack.patient.feature.patient.controller;

import com.dentalstack.patient.feature.patient.dto.PatientNotesRequest;
import com.dentalstack.patient.feature.patient.dto.PatientNotesResponse;
import com.dentalstack.patient.feature.patient.dto.UpdatePatientNotesRequest;
import com.dentalstack.patient.feature.patient.service.PatientNotesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/notes/v1")
@RequiredArgsConstructor
@Tag(name = "Patient Notes", description = "API for managing patient notes")
public class PatientNotesController {

    private final PatientNotesService patientNotesService;

    @PostMapping
    @Operation(summary = "Add a new note to a patient")
    public ResponseEntity<PatientNotesResponse> addNote(@Valid @RequestBody PatientNotesRequest noteRequest) {
        PatientNotesResponse note = patientNotesService.addNote(noteRequest);
        return new ResponseEntity<>(note, HttpStatus.CREATED);
    }

    @PutMapping
    @Operation(summary = "Update an existing patient note")
    public ResponseEntity<PatientNotesResponse> updateNote(@Valid @RequestBody UpdatePatientNotesRequest noteRequest) {
        PatientNotesResponse updatedNote = patientNotesService.updateNote(noteRequest);
        return ResponseEntity.ok(updatedNote);
    }

    @DeleteMapping("/{patientId}/{noteId}")
    @Operation(summary = "Delete a patient note")
    public ResponseEntity<Void> deleteNote(@PathVariable Long patientId, @PathVariable Long noteId) {

        patientNotesService.deleteNote(patientId, noteId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{patientId}")
    @Operation(summary = "Get all notes for a patient")
    public ResponseEntity<List<PatientNotesResponse>> getNotesByPatientId(@PathVariable Long patientId) {
        List<PatientNotesResponse> notes = patientNotesService.getNotesByPatientId(patientId);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/profile/{profileId}/{patientId}")
    @Operation(summary = "Get all notes added by a user profile")
    public ResponseEntity<List<PatientNotesResponse>> getNotesByProfileId(
            @PathVariable Long profileId, @PathVariable Long patientId) {
        List<PatientNotesResponse> notes = patientNotesService.getNotesByProfileId(profileId, patientId);
        return ResponseEntity.ok(notes);
    }
}
