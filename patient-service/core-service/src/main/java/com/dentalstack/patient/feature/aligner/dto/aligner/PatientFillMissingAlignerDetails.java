package com.dentalstack.patient.feature.aligner.dto.aligner;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientFillMissingAlignerDetails {

    private long treatmentPlanId;

    private LocalDate startDate;

    private LocalDate endDate;

    private int currentAlignerNo;

    private Long profileId;
}
