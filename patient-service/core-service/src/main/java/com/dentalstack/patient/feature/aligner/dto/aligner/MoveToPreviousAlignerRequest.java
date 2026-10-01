package com.dentalstack.patient.feature.aligner.dto.aligner;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MoveToPreviousAlignerRequest {
    private long alignerJourneyId;
    private int previousAlignerSrNo;

    @NotNull
    private LocalDate previousAlignerNewEndDate;

    private String reason;
}
