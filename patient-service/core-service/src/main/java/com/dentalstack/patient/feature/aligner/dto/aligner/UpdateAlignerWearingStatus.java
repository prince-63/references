package com.dentalstack.patient.feature.aligner.dto.aligner;

import jakarta.annotation.Nullable;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateAlignerWearingStatus {
    private Long patientId;

    @Nullable
    private LocalDate date;

    private long wearingDurationInSec;

    @Nullable
    private Integer alignerSrNo;
}
