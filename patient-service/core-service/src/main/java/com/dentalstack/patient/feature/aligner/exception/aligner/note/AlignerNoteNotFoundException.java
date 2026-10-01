package com.dentalstack.patient.feature.aligner.exception.aligner.note;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AlignerNoteNotFoundException extends BusinessException {
    public AlignerNoteNotFoundException(long alignerJourneyId, long noteId) {
        super(
                BusinessErrorCode.NOTE_NOT_FOUND,
                String.format("Note with id %s not found for aligner journey %s", noteId, alignerJourneyId));
    }
}
