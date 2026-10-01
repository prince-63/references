package com.dentalstack.patient.feature.treatmenttracking.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.treatmenttracking.enums.TreatmentPlanStatus;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Table(
        name = "aligner_tracking_plan",
        indexes = {
            @Index(name = "IX_aligner_tracking_plan_patient_id", columnList = "patient_id"),
            @Index(name = "IX_aligner_tracking_plan_doctor_id", columnList = "doctorId")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlignerTrackingPlan extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_profile_id", nullable = false)
    @ToString.Exclude
    private UserProfile createdByUserProfile;

    @NotNull
    private Long doctorId;

    @NotNull
    private String name;

    private Integer treatmentVersion;

    @Nullable
    private Integer upperAlignerStartNo;

    @Nullable
    private Integer upperAlignerEndNo;

    @Nullable
    private Integer lowerAlignerStartNo;

    @Nullable
    private Integer lowerAlignerEndNo;

    @NotNull
    private Integer stages;

    private Integer wearDaysPerAligner;

    @Enumerated(EnumType.STRING)
    private TreatmentPlanStatus status;

    @OneToMany(mappedBy = "treatmentPlan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AlignerStage> alignerStages = new ArrayList<>();

    private Integer currentAlignerNumber;

    private String planningLink;
    private String iprAttachmentChart;

    public int upperSeriesCount() {
        if (upperAlignerStartNo == null || upperAlignerEndNo == null) return 0;
        return upperAlignerEndNo - upperAlignerStartNo + 1;
    }

    public int lowerSeriesCount() {
        if (lowerAlignerStartNo == null || lowerAlignerEndNo == null) return 0;
        return lowerAlignerEndNo - lowerAlignerStartNo + 1;
    }

    public static int[] determineOverallRange(
            @Nullable Integer upperStart,
            @Nullable Integer upperEnd,
            @Nullable Integer lowerStart,
            @Nullable Integer lowerEnd) {

        int lowest = Integer.MAX_VALUE;
        int highest = Integer.MIN_VALUE;

        if (upperStart != null && upperEnd != null) {
            lowest = Math.min(lowest, upperStart);
            highest = Math.max(highest, upperEnd);
        }
        if (lowerStart != null && lowerEnd != null) {
            lowest = Math.min(lowest, lowerStart);
            highest = Math.max(highest, lowerEnd);
        }

        if (lowest == Integer.MAX_VALUE && highest == Integer.MIN_VALUE) {
            return new int[] {1, 0};
        }
        return new int[] {lowest, highest};
    }

    public boolean isUpperAligner(int alignerNumber) {
        return upperAlignerStartNo != null
                && upperAlignerEndNo != null
                && alignerNumber >= upperAlignerStartNo
                && alignerNumber <= upperAlignerEndNo;
    }

    public boolean isLowerAligner(int alignerNumber) {
        return lowerAlignerStartNo != null
                && lowerAlignerEndNo != null
                && alignerNumber >= lowerAlignerStartNo
                && alignerNumber <= lowerAlignerEndNo;
    }
}
