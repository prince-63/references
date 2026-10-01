package com.dentalstack.patient.feature.aligner.dto.analytics;

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
public class AlignerAnalyticsCountResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private PatientCompliance patientCompliance;
    private double onTrackPercentage;
    private AlignerChanges alignerChangesTillDate;
    private AlignerCheckIn alignerCheckInTillDate;
    private IssuesReported issuesReportedTillDate;
    private Integer totalAlignerChanges;
    private Integer totalAlignerCheckIns;
    private Integer totalIssuesReported;
    private Long uniquePatientWithActionCounts;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PatientCompliance {
        private Integer needsAttention;
        private Integer atRisk;
        private Integer onTrack;
        private double onTrackPercentage;

        public static PatientCompliance init() {
            return new PatientCompliance(0, 0, 0, 0.0);
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
    public static class AlignerChanges {
        private int onTime;
        private int delay;
        private int early;
        private int delayLessThan7Days;
        private int delayMoreThan7Days;
        private double onTimePercentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlignerCheckIn {
        private int perfectFit;
        private int someIssue;
        private double perfectFitPercentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IssuesReported {
        private int missingAligner;
        private int brokenAligner;
        private int irritationToGums;
        private int sharpEdges;
        private double totalIssueReportedPercentage;
    }
}
