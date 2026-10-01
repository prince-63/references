package com.dentalstack.patient.feature.vsp.entity;

import com.dentalstack.patient.feature.vsp.enums.VspTreatmentPlanStatus;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(
        name = "vsp_treatment_sub_plan",
        indexes = {@Index(name = "IX_vsp_treatment_sub_plan_plan_id", columnList = "vsp_treatment_plan_id")})
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VspTreatmentSubPlan extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vsp_treatment_plan_id", nullable = false)
    @ToString.Exclude
    private VspTreatmentPlan treatmentPlan;

    @NotNull
    private String subPlanName;

    private Integer subPlanIndex;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VspTreatmentPlanStatus status = VspTreatmentPlanStatus.DRAFT;
}
