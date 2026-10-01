package com.dentalstack.patient.feature.aligner.dto.aligner.note;

import com.dentalstack.patient.feature.user.enums.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateNoteRequest {
    private long noteId;
    private long alignerJourneyId;
    private long updatedBy;

    @NotNull
    private UserType updatedByUser;

    private String title;

    private String text;
}
