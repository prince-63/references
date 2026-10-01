package com.dentalstack.patient.feature.doctor.dto;

import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorDashboardCount implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private TreatmentStageCount allTreatments;
    private TreatmentStageCount alignerTreatments;
    private TreatmentStageCount bracesTreatments;
    private Long unreadChatCount;
    private Long unreadNotificationCount;
    private PatientCount patientCount;
    private Integer customerCount;
    private TreatmentCount leadCount;
    private PatientCompliance patientCompliance;
    private AppointmentCounts appointmentCounts;
    private AlignerUpdateCounts alignerActionCounts;
    private PracticeCounts practiceCounts;
    private LabCounts labCounts;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PatientCount {
        private int total;
        private int active;
        private int lead;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TreatmentCount {
        private int total;
        private int inAssessment;
        private int inPlanning;
        private int trackingPending;
        private int completed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TreatmentStageCount {
        private int total;
        private int startingSoon;
        private int ongoing;
        private int paused;
        private int refinement;
        private int completed;

        public static TreatmentStageCount init() {
            return TreatmentStageCount.builder()
                    .total(0)
                    .startingSoon(0)
                    .ongoing(0)
                    .paused(0)
                    .refinement(0)
                    .completed(0)
                    .build();
        }

        public void incrementTotal() {
            this.total++;
        }

        public void incrementStartingSoon() {
            this.startingSoon++;
        }

        public void incrementOngoing() {
            this.ongoing++;
        }

        public void incrementPaused() {
            this.paused++;
        }

        public void incrementCompleted() {
            this.completed++;
        }

        public void incrementRefinement() {
            this.refinement++;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PatientCompliance {
        private Integer needsAttention;
        private Integer atRisk;
        private Integer onTrack;
        private double onTrackPercentage;

        public static PatientCompliance init() {
            return new PatientCompliance(0, 0, 0, 0);
        }

        public void incrementNeedsAttention() {
            this.needsAttention++;
        }

        public void incrementAtRisk() {
            this.atRisk++;
        }

        public void incrementOnTrack() {
            this.onTrack++;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AppointmentCounts {
        private Integer todaysAppointment;
        private Integer tomorrowAppointments;
        private Integer dayAfterTomorrowAppointments;

        public static AppointmentCounts init() {
            return new AppointmentCounts(0, 0, 0);
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlignerUpdateCounts {
        private int total;

        public static AlignerUpdateCounts init() {
            return new AlignerUpdateCounts(0);
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PracticeCounts {
        private Integer total;
        private Integer totalActivePractice;
        private Integer totalActiveCustomer;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class LabCounts {
        private Integer total;
    }
}
