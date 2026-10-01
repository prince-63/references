package com.dentalstack.patient.feature.aligner.dto.aligner;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateAlignerJourneyByPatientRequest {
    private Long alignerJourneyId;
    private Long patientId;
    private LocalDate treatmentStartDate;
    private int currentAlignerNo;
}
