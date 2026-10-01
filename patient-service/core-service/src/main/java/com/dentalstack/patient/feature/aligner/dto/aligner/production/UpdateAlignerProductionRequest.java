package com.dentalstack.patient.feature.aligner.dto.aligner.production;

import com.dentalstack.patient.feature.aligner.enums.ProductionSubStatus;
import jakarta.annotation.Nullable;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateAlignerProductionRequest {
    private long alignerJourneyId;

    private Set<Integer> alignerNos;

    @Nullable
    private Long productionLabId;

    @Nullable
    private ProductionSubStatus subStatus;

    @Nullable
    private Integer wearDays;

    private Long profileId;
}
