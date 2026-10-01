package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.treatment.enums.ProductionSubStatus;
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
