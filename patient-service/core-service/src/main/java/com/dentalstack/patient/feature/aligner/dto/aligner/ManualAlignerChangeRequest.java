package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ManualAlignerChangeRequest {
    private Long patientId;
    private Long alignerJourneyId;
    private Integer newAlignerNo;

    @NotNull
    private LocalDate previousAlignerChangeDate;

    public static ManualAlignerChangeRequest from(
            AlignerJourney alignerJourney, Integer newAlignerNo, LocalDate previousAlignerChangeDate) {
        return ManualAlignerChangeRequest.builder()
                .patientId(alignerJourney.getPatient().getId())
                .alignerJourneyId(alignerJourney.getId())
                .newAlignerNo(newAlignerNo)
                .previousAlignerChangeDate(previousAlignerChangeDate)
                .build();
    }
}
