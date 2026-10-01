package com.dentalstack.patient.feature.aligner.entity.production;

import com.dentalstack.patient.feature.aligner.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.production.ProductionStatus;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "aligner_production_log",
        indexes = {
            @Index(name = "IX_production_log_aligner_production_id", columnList = "aligner_production_id"),
            @Index(
                    name = "IX_production_log_aligner_production_order_log_id",
                    columnList = "aligner_production_order_log_id")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class AlignerProductionLog extends BaseEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private int srNo;

    @Nullable
    private String oldAlignerProductionLab;

    @Nullable
    private String newAlignerProductionLab;

    @Nullable
    @Enumerated(EnumType.STRING)
    private ProductionStatus oldProductionStatus;

    @Nullable
    @Enumerated(EnumType.STRING)
    private ProductionStatus newProductionStatus;

    @Nullable
    @Enumerated(EnumType.STRING)
    private ProductionSubStatus oldProductionSubStatus;

    @Nullable
    @Enumerated(EnumType.STRING)
    private ProductionSubStatus newProductionSubStatus;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "aligner_production_id")
    private AlignerProduction alignerProduction;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "aligner_production_order_log_id")
    private AlignerProductionOrderLog alignerProductionOrderLog;

    public static AlignerProductionLog newLog(
            AlignerProduction oldProduction, AlignerProductionOrderLog alignerProductionOrderLog) {
        return AlignerProductionLog.builder()
                .srNo(oldProduction.getLogs().size() + 1)
                .alignerProduction(oldProduction)
                .alignerProductionOrderLog(alignerProductionOrderLog)
                .build();
    }

    public void recordSubStatusChange(
            @Nullable ProductionSubStatus oldProductionSubStatus,
            @Nullable ProductionSubStatus newProductionSubStatus) {
        if (Objects.equals(oldProductionSubStatus, newProductionSubStatus)) return;

        if (oldProductionSubStatus != null) {
            this.oldProductionSubStatus = oldProductionSubStatus;
            this.oldProductionStatus = ProductionStatus.of(oldProductionSubStatus);
        }
        this.newProductionSubStatus = newProductionSubStatus;
        this.newProductionStatus = ProductionStatus.of(newProductionSubStatus);
    }

    public void recordAlignerProductionLabChange(
            @Nullable AlignerProductionLab oldAlignerProductionLab,
            @Nullable AlignerProductionLab newAlignerProductionLab) {
        if (Objects.equals(oldAlignerProductionLab, newAlignerProductionLab)) return;

        if (oldAlignerProductionLab != null) this.oldAlignerProductionLab = oldAlignerProductionLab.getName();
        if (newAlignerProductionLab != null) this.newAlignerProductionLab = newAlignerProductionLab.getName();
    }

    public record Changes(
            String oldAlignerProductionLab,
            String newAlignerProductionLab,
            ProductionSubStatus oldProductionSubStatus,
            ProductionSubStatus newProductionSubStatus,
            ProductionStatus oldProductionStatus,
            ProductionStatus newProductionStatus) {
        public static Changes from(AlignerProductionLog log) {
            return new AlignerProductionLog.Changes(
                    log.getOldAlignerProductionLab(),
                    log.getNewAlignerProductionLab(),
                    log.getOldProductionSubStatus(),
                    log.getNewProductionSubStatus(),
                    log.getOldProductionStatus(),
                    log.getNewProductionStatus());
        }
    }
}
