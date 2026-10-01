package com.dentalstack.patient.feature.aligner.entity;

import com.dentalstack.patient.feature.aligner.enums.AlignerProgressStatus;
import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.user.enums.UserType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class LeadAlignerJourney {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @NotNull
    private long doctorId;

    @OneToMany(mappedBy = "leadAlignerJourney", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LeadAligner> leadAligners = new ArrayList<>();

    private int daysToWearEachAligner;
    private int recommendedHoursToWearAligners;
    private Integer currentAlignerNo;

    @Nullable
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aligner_treatment_plan_id")
    private TreatmentPlan alignerTreatmentPlan;

    private boolean askForPatientToFill;

    @NotNull
    @Enumerated(EnumType.STRING)
    private AlignerProgressStatus progressStatus;

    @NotNull
    @Enumerated(EnumType.STRING)
    private UserType userType;

    private String pricing;

    private boolean isTreatmentFinalised;

    @Enumerated(EnumType.STRING)
    private TrackingType trackingType;
}
