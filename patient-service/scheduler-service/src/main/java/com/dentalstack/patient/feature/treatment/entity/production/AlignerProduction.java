package com.dentalstack.patient.feature.treatment.entity.production;

import com.dentalstack.patient.feature.treatment.entity.Aligner;
import com.dentalstack.patient.feature.treatment.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.treatment.enums.production.ProductionStatus;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "aligner_production",
        indexes = {
            @Index(name = "IX_aligner_production_status", columnList = "status"),
            @Index(name = "IX_production_order_id", columnList = "aligner_production_order_id"), // Foreign key index
            @Index(name = "IX_aligner_id", columnList = "aligner_id"), // Foreign key index
            @Index(
                    name = "IX_status_subStatus",
                    columnList = "status, subStatus"), // Composite index for frequent filters on status and subStatus
            @Index(name = "IX_statusChangedAt", columnList = "statusChangedAt") // Index for time-based queries
        })
@Getter
@Setter
@ToString(exclude = {"alignerProductionOrder", "logs"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class AlignerProduction extends BaseEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ManyToOne
    @NotNull
    @JoinColumn(name = "aligner_production_order_id")
    private AlignerProductionOrder alignerProductionOrder;

    @Nullable
    @OneToOne
    @JoinColumn(name = "aligner_production_lab_id")
    private AlignerProductionLab alignerProductionLab;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ProductionStatus status;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ProductionSubStatus subStatus;

    @NotNull
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aligner_id")
    private Aligner aligner;

    @Builder.Default
    @OneToMany(mappedBy = "alignerProduction", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<AlignerProductionLog> logs = new ArrayList<>();

    public ZonedDateTime statusChangedAt;

    public boolean canChangeStatus(@Nullable ProductionSubStatus newSubStatus) {
        return newSubStatus != null && !newSubStatus.equals(this.subStatus);
    }

    public boolean changeStatus(@Nullable ProductionSubStatus newSubStatus) {
        if (!canChangeStatus(newSubStatus)) return false;

        this.subStatus = newSubStatus;
        this.status = ProductionStatus.of(newSubStatus);
        this.statusChangedAt = ZonedDateTime.now();
        return true;
    }

    public boolean changeProductionLab(@Nullable AlignerProductionLab newProductionLab) {
        if (!canChangeProductionLab(newProductionLab)) return false;

        this.alignerProductionLab = newProductionLab;
        return true;
    }

    public boolean canChangeProductionLab(AlignerProductionLab newProductionLab) {
        return newProductionLab != null && !newProductionLab.equals(this.alignerProductionLab);
    }
}
