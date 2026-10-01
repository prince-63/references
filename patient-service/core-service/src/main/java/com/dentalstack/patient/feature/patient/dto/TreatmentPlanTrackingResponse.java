package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.tracking.enums.PatientTrackingStatus;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TreatmentPlanTrackingResponse {

    private boolean isEnabled;

    private Long journeyId;

    private Long treatmentPlanId;

    private AlignerTreatmentStatus alignerTreatmentStatus;

    private PatientTrackingStatus patientTrackingStatus;

    private LocalDate resumeDate;

    private String treatmentPlanCompletedRemarks;

    private ZonedDateTime treatmentPlanCompletedDate;

    public static TreatmentPlanTrackingResponse from(TreatmentPlan plan) {
        return TreatmentPlanTrackingResponse.builder()
                .isEnabled(plan != null && plan.getStatus().equals(AlignerTreatmentStatus.ACTIVE))
                .journeyId(
                        plan != null
                                        && plan.getTracking() != null
                                        && plan.getTracking().getAlignerJourney() != null
                                ? plan.getTracking().getAlignerJourney().getId()
                                : null)
                .treatmentPlanId(plan != null ? plan.getId() : null)
                .alignerTreatmentStatus(plan != null ? plan.getStatus() : null)
                .patientTrackingStatus(
                        plan != null && plan.getTracking() != null
                                ? plan.getTracking().getPatientTrackingStatus()
                                : null)
                .resumeDate(
                        plan != null
                                        && plan.getTracking() != null
                                        && plan.getTracking().getResumeDate() != null
                                ? plan.getTracking().getResumeDate()
                                : null)
                .treatmentPlanCompletedRemarks(
                        plan != null && plan.getTreatmentPlanCompletedRemarks() != null
                                ? plan.getTreatmentPlanCompletedRemarks()
                                : null)
                .treatmentPlanCompletedDate(
                        plan != null && plan.getTreatmentPlanCompletedDate() != null
                                ? plan.getTreatmentPlanCompletedDate()
                                : null)
                .build();
    }
}
