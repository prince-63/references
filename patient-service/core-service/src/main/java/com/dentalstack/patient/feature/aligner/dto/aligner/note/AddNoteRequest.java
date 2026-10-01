package com.dentalstack.patient.feature.aligner.dto.aligner.note;

import com.dentalstack.patient.feature.user.enums.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddNoteRequest {
    private long alignerJourneyId;

    @NotNull
    private long userId;

    @NotNull
    private UserType userType;

    @NotNull
    private String title;

    @NotNull
    private String text;
}
