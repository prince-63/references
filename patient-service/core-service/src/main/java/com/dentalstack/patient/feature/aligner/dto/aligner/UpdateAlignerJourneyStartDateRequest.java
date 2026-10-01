package com.dentalstack.patient.feature.aligner.dto.aligner;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateAlignerJourneyStartDateRequest {
    private long alignerJourneyId;

    @NotNull
    private LocalDate startDate;
}
