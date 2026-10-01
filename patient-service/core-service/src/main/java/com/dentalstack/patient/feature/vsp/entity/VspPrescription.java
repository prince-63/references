package com.dentalstack.patient.feature.vsp.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.vsp.enums.VspPrescriptionMode;
import com.dentalstack.patient.feature.vsp.enums.VspPrescriptionStatus;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.*;

@Entity
@Table(
        name = "vsp_prescription",
        indexes = {
            @Index(name = "IX_vsp_prescription_order_id", columnList = "vsp_order_id"),
            @Index(name = "IX_vsp_prescription_status", columnList = "status")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VspPrescription extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vsp_order_id", nullable = true)
    @ToString.Exclude
    private VspOrder vspOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Enumerated(EnumType.STRING)
    private VspPrescriptionMode prescriptionMode;

    @Builder.Default
    private Boolean isSingleJaw = false;

    @Builder.Default
    private Boolean isBiJaw = false;

    @Builder.Default
    private Boolean isUndecided = false;

    @Builder.Default
    private Boolean isGenioplasty = false;

    @Builder.Default
    private Boolean isOthers = false;

    @Column(columnDefinition = "TEXT")
    private String othersDescription;

    @Column(columnDefinition = "TEXT")
    private String treatmentPlan;

    private LocalDate tentativeSurgeryDate;

    private LocalDate earliestTreatmentPlanByDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VspPrescriptionStatus status = VspPrescriptionStatus.DRAFT;

    public static VspPrescription getLatestPrescription(VspOrder order) {
        return order.getPrescriptions().stream()
                .max(Comparator.comparing(VspPrescription::getCreatedAt))
                .orElse(null);
    }

    public static String formatDate(LocalDate date) {
        return date != null ? date.toString() : null;
    }

    public static String calculateDays(LocalDate date) {
        if (date == null) return null;
        long days = ChronoUnit.DAYS.between(LocalDate.now(), date);
        return String.valueOf(Math.max(0, days));
    }

    public static String buildSurgeryType(VspPrescription p) {
        if (p == null) return null;
        List<String> types = new ArrayList<>();
        if (Boolean.TRUE.equals(p.getIsSingleJaw())) types.add("Single Jaw");
        if (Boolean.TRUE.equals(p.getIsBiJaw())) types.add("Bi-Jaw");
        if (Boolean.TRUE.equals(p.getIsUndecided())) types.add("Undecided");
        if (Boolean.TRUE.equals(p.getIsGenioplasty())) types.add("Genioplasty");
        if (Boolean.TRUE.equals(p.getIsOthers()) && p.getOthersDescription() != null) {
            types.add(p.getOthersDescription());
        }
        return types.isEmpty() ? null : String.join(", ", types);
    }
}
