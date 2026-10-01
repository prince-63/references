package com.dentalstack.patient.feature.aligner.dto.aligner;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StartAlignerJourneyRequest {
    private Long patientId;
    private Long alignerJourneyId;
}
