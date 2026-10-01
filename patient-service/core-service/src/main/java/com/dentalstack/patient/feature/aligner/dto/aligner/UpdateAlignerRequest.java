package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import jakarta.annotation.Nullable;
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
public class UpdateAlignerRequest {
    private long alignerJourneyId;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private int alignerSrNo;

    @NotNull
    private JawType jawType;

    @Nullable
    private ProductionSubStatus subStatus;

    @Nullable
    private Long productionLabId;

    @Nullable
    private Boolean isToTriggerNotification;

    @Nullable
    private Boolean isForceAlignerChange;

    @Nullable
    private Boolean isNotificationForPauseResume;
}
