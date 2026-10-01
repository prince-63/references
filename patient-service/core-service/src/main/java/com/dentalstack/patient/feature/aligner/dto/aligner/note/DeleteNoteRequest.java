package com.dentalstack.patient.feature.aligner.dto.aligner.note;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeleteNoteRequest {
    private long noteId;
    private long alignerJourneyId;
}
