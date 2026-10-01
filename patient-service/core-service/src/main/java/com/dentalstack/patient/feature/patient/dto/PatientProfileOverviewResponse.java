package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.TreatmentPlanUploadType;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.patient.enums.PatientType;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientProfileOverviewResponse {

    private Integer currentAligner;
    private Integer totalAligner;
    private Integer overDue;
    private Integer pendingActionsCount;
    private String treatmentPlanningLink;
    private UpcomingAppointment upcomingAppointment;
    private Long treatmentPlanId;
    private String treatmentPlanName;
    private String treatmentPlanTagName;
    private String orderId;
    private TreatmentPlanUploadType treatmentPlanUploadType;
    private PatientType patientType;
    private AlignerTreatmentStatus treatmentPlanStatus;
    private Boolean treatmentPlanCompleted;
    private ZonedDateTime treatmentCompilationDate;
    private String treatmentPlanCompletedRemarks;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UpcomingAppointment {
        private ZonedDateTime startDate;
        private ZonedDateTime endDate;
    }
}
