package com.dentalstack.patient.feature.vsp.entity;

import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.vsp.enums.VspTreatmentPlanStatus;
import com.dentalstack.patient.feature.vsp.enums.VspTreatmentPlanType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.*;

@Entity
@Table(
        name = "vsp_treatment_plan",
        indexes = {
            @Index(name = "IX_vsp_treatment_plan_order_id", columnList = "vsp_order_id"),
            @Index(name = "IX_vsp_treatment_plan_status", columnList = "status")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VspTreatmentPlan extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vsp_order_id", nullable = true)
    @ToString.Exclude
    private VspOrder vspOrder;

    @NotNull
    private String planName;

    private Integer planIndex;

    @NotNull
    @Enumerated(EnumType.STRING)
    private VspTreatmentPlanType planType;

    @OneToMany(mappedBy = "treatmentPlan", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private List<VspTreatmentSubPlan> subPlans = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinTable(name = "vsp_treatment_plan_attachment_files")
    @Builder.Default
    @ToString.Exclude
    private Set<File> attachmentFiles = new HashSet<>();

    @Column(columnDefinition = "TEXT")
    private String labComments;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VspTreatmentPlanStatus status = VspTreatmentPlanStatus.DRAFT;
}
