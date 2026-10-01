package com.dentalstack.patient.feature.tracking.entity;

import com.dentalstack.patient.feature.aligner.dto.aligner.v2.CreateAlignerJourneyRequest;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
import com.dentalstack.patient.feature.tracking.enums.PatientTrackingStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
        name = "tracking",
        indexes = {
            @Index(name = "IX_tracking_treatment_plan_id", columnList = "treatment_plan_id"),
            @Index(name = "IX_tracking_aligner_journey_id", columnList = "aligner_journey_id"),
            @Index(
                    name = "IX_tracking_status_tracking_type_ask_patient_to_fill",
                    columnList = "status, trackingType, askPatientToFill"),
            @Index(name = "IX_tracking_patient_id", columnList = "patientId"),
            @Index(name = "IX_tracking_status_patient_id", columnList = "status, patientId"),
            @Index(name = "IX_tracking_status_patient_id_created_at", columnList = "status, patientId"),
            @Index(
                    name = "IX_tracking_patient_id_status_tracking_type_created_at",
                    columnList = "patientId, status, trackingType")
        })
public class Tracking extends BaseEntity {

    private long patientId;

    @NonNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "treatment_plan_id")
    private TreatmentPlan treatmentPlan;

    @Nullable
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aligner_journey_id")
    private AlignerJourney alignerJourney;

    private UserType userType;

    private BigDecimal pricing;

    @Enumerated(EnumType.STRING)
    private Status status;

    private TrackingType trackingType;

    private Boolean askPatientToFill;

    private Boolean sendToPatient;

    @Nullable
    @Column(columnDefinition = "text")
    private String reasonForPausing;

    @Nullable
    @Enumerated(EnumType.STRING)
    private PatientDataFillStatus patientDataFillStatus;

    @Nullable
    private LocalDate pauseDate;

    @Nullable
    private LocalDate resumeDate;

    @Nullable
    private Boolean isPatientConnected;

    @Nullable
    private Boolean isCurrentAlignerChanged;

    @Nullable
    private Boolean isCurrentAlignerDaysExtended;

    @Nullable
    private Integer daysExtended;

    @Nullable
    private Integer previousAlignerWearDays;

    @Enumerated(EnumType.STRING)
    private PatientTrackingStatus patientTrackingStatus;

    public static Tracking addTracking(TreatmentPlan treatmentPlan, CreateAlignerJourneyRequest request) {
        PatientDataFillStatus patientDataFillStatus = request.isAskToPatientFill()
                ? PatientDataFillStatus.ASK_PATIENT_TO_FILL
                : PatientDataFillStatus.UNASSIGNED;
        return Tracking.builder()
                .patientId(treatmentPlan.getPatient().getId())
                .treatmentPlan(treatmentPlan)
                .userType(request.getUserType())
                .pricing(request.getPricing())
                .status(request.getStatus())
                .trackingType(request.getTrackingType())
                .askPatientToFill(request.isAskToPatientFill())
                .sendToPatient(request.isAskToPatientFill())
                .patientDataFillStatus(patientDataFillStatus)
                .isPatientConnected(false)
                .build();
    }

    public Tracking updateTreatmentPlanDetails(CreateAlignerJourneyRequest request) {
        this.askPatientToFill = request.isAskToPatientFill();
        this.patientDataFillStatus =
                this.askPatientToFill ? PatientDataFillStatus.ASK_PATIENT_TO_FILL : PatientDataFillStatus.UNASSIGNED;
        this.status = request.getStatus();
        this.askPatientToFill = request.isAskToPatientFill();
        return this;
    }
}
