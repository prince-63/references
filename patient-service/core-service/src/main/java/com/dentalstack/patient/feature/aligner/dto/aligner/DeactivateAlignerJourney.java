package com.dentalstack.patient.feature.aligner.dto.aligner;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeactivateAlignerJourney {

    private String reasonForDeactivation;

    private long treatmentPlanId;

    @Nullable
    private String otherRemarks;
}
