package com.dentalstack.patient.feature.treatmenttracking.entity;

import com.dentalstack.patient.feature.treatmenttracking.enums.AlignerChangeStatus;
import com.dentalstack.patient.feature.treatmenttracking.enums.AlignerStatus;
import com.dentalstack.patient.feature.treatmenttracking.enums.JawType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import lombok.*;

@Entity
@Table(
        name = "aligner_stage",
        indexes = {
            @Index(name = "IX_aligner_stage_plan_id", columnList = "treatment_plan_id"),
            @Index(name = "IX_aligner_stage_number", columnList = "treatment_plan_id, alignerNumber")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlignerStage extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "treatment_plan_id")
    private AlignerTrackingPlan treatmentPlan;

    @NotNull
    private Integer alignerNumber;

    @NotNull
    @Enumerated(EnumType.STRING)
    private JawType jawType;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @Nullable
    private LocalDate changeDate;

    private Integer wearDays;

    private Integer extendedDays;

    @Enumerated(EnumType.STRING)
    private AlignerStatus status;

    private Boolean isCurrentAligner;

    @Builder.Default
    private Boolean checkedIn = false;

    @Builder.Default
    private Boolean issueReported = false;

    @Nullable
    public AlignerChangeStatus alignerChangeStatus() {
        if (changeDate == null) return null;

        if (changeDate.isBefore(endDate)) return AlignerChangeStatus.EARLY;
        else if (changeDate.isAfter(endDate)) return AlignerChangeStatus.DELAYED;
        return AlignerChangeStatus.ON_TIME;
    }

    @Nullable
    public Integer changeOffset() {
        if (changeDate == null || endDate == null) return null;
        return Math.toIntExact(endDate.until(changeDate, ChronoUnit.DAYS));
    }
}
