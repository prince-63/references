package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerTreatmentStage;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.annotation.Nullable;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorPatientDetails implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private String patientName;
    private String mobile;
    private CountryCode countryCode;
    private String patientProfile;
    private String email;

    private Long alignerJourneyId;
    private String currentAligner;

    private LocalDate treatmentStartDate;
    private LocalDate treatmentPauseDate;
    private ZonedDateTime treatmentCompleteDate;

    private float avgWearTimeInSecs;
    private boolean isTreatmentFilled;
    private String invitationCode;

    private LocalDate currentAlignerStartDate;
    private LocalDate currentAlignerEndDate;
    private LocalDate endAlignerStartDate;
    private Integer daysRemaining;
    private String practiceLocationName;
    private String brandName;

    @Nullable
    private Compliance currentAlignerCompliance;

    private ProgressStatus progressStatus;
    private String pendingPatientStatus;
    private AlignerTreatmentStatus status;

    @Nullable
    private LocalDate latestDeactivatedDate;

    private Boolean isYourPatient;
    private Boolean isPracticeAssigned;
    private PatientBelongsTo patientBelongsTo;
    private ZonedDateTime patientAddedOn;
    private String treatmentDeactivatedReason;
    private String treatmentDeactivatedRemark;
    private LocalDate deactivatedAt;
    private AppInviteStatus appInviteStatus;
    private AlignerTreatmentStage alignerTreatmentStage;
}
