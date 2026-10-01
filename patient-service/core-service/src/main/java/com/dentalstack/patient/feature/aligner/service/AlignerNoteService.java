package com.dentalstack.patient.feature.aligner.service;

import com.dentalstack.patient.feature.aligner.dto.aligner.note.AddNoteRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.note.DeleteNoteRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.note.UpdateNoteRequest;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;

public interface AlignerNoteService {
    AlignerJourney addNote(AddNoteRequest request);

    AlignerJourney updateNote(UpdateNoteRequest request);

    AlignerJourney deleteNote(DeleteNoteRequest request);
}
