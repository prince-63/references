package com.dentalstack.patient.feature.aligner.controller.v1;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.note.AddNoteRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.note.DeleteNoteRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.note.UpdateNoteRequest;
import com.dentalstack.patient.feature.aligner.service.AlignerNoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Aligner Notes", description = "Aligner notes APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/aligner/note/v1")
public class AlignerNoteController {

    private final AlignerNoteService alignerNoteService;

    @PostMapping("/")
    @Operation(summary = "Add new note")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> addNote(@Valid @RequestBody AddNoteRequest request) {
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerNoteService.addNote(request)));
    }

    @PostMapping("/update")
    @Operation(summary = "Update a note")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> updateNote(@Valid @RequestBody UpdateNoteRequest request) {
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerNoteService.updateNote(request)));
    }

    @PostMapping("/delete")
    @Operation(summary = "Delete a note")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> deleteNote(@Valid @RequestBody DeleteNoteRequest request) {
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerNoteService.deleteNote(request)));
    }
}
