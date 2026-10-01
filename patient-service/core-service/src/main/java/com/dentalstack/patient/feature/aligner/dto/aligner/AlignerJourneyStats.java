package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.DailyAlignerWearTime;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.aligner.enums.aligner.CreationStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.TreatmentStage;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerJourneyStats implements Serializable {

    @Deprecated
    @Parameter(description = "Key is the date of the daily wear time records.")
    private Map<LocalDate, DailyWearTimeStats> dateDailyWearTimeRecords;

    @Parameter(description = "Key is the date of the daily wear time records.")
    private Map<LocalDate, List<DailyWearTimeStats>> wearTimeRecords;

    private CurrentAlignerStats currentAligner;
    private int totalAligners;
    private float avgWearTimeSec;

    private LocalDate nextAlignerChangeDate;
    private long doctorId;

    private String treatmentType;
    private String treatmentSubType;
    private String brand;
    private TreatmentStage treatmentStage;
    private ProgressStatus progressStatus;
    private CreationStatus creationStatus;

    private int daysToWearEachAligner;
    private int recommendedHoursToWearAligners;
    private Integer currentAlignerNo;
    private Long numbersOfDaysAlignersWornTillNow;

    @Schema(title = "Treatment start date set by the doctor")
    private LocalDate doctorTreatmentStartDate;

    @Nullable
    @Schema(title = "The date on which patient actually started the treatment")
    private LocalDate patientTreatmentStartDate;

    @Schema(
            title = "The start date of the first aligner",
            description =
                    """
            It is not necessary that this date is equal to patient treatment start date, specially when treatment is the mid treatment.
            """)
    private LocalDate firstAlignerStartDate;

    @Schema(
            title = "The date at which treatment should ideally end as per doctor's plan",
            description = "This date is equal to end date of the last aligner")
    private LocalDate doctorTreatmentEndDate;

    @Schema(
            title = "The date at which treatment actually ended",
            description = "This date is equal to change date of the last aligner")
    private LocalDate patientTreatmentEndDate;

    private boolean active;

    public static AlignerJourneyStats from(
            AlignerJourney alignerJourney, List<DailyAlignerWearTime> dailyWearTimeRecords) {
        Map<LocalDate, DailyWearTimeStats> dailyWearTimeStats = new TreeMap<>(Comparator.reverseOrder());
        dailyWearTimeRecords.forEach(r -> {
            var stats = dailyWearTimeStats.getOrDefault(
                    r.getDate(),
                    new DailyWearTimeStats(r.getDate(), 0, r.getAligner().getSrNo()));
            stats.plus(r);
            dailyWearTimeStats.put(r.getDate(), stats);
        });
        Map<LocalDate, List<DailyWearTimeStats>> records = new TreeMap<>(Comparator.reverseOrder());
        dailyWearTimeRecords.forEach(r -> {
            var stats = records.getOrDefault(r.getDate(), new ArrayList<>());
            DailyWearTimeStats.update(stats, r);
            records.put(r.getDate(), stats);
        });

        return AlignerJourneyStats.builder()
                .currentAligner(CurrentAlignerStats.from(alignerJourney.getCurrentAligner()))
                .totalAligners(alignerJourney.totalAligners())
                .avgWearTimeSec(alignerJourney.avgWearTimeInSecs())
                .nextAlignerChangeDate(alignerJourney.nextAlignerChangeDate())
                .doctorId(alignerJourney.getDoctorId())
                .treatmentType(alignerJourney.getTreatmentType())
                .treatmentSubType(alignerJourney.getTreatmentSubType())
                .brand(alignerJourney.getBrand())
                .treatmentStage(alignerJourney.getTreatmentStage())
                .daysToWearEachAligner(alignerJourney.getDaysToWearEachAligner())
                .recommendedHoursToWearAligners(alignerJourney.getRecommendedHoursToWearAligners())
                .currentAlignerNo(alignerJourney.getCurrentAlignerNo())
                .doctorTreatmentStartDate(alignerJourney.getDoctorTreatmentStartDate())
                .patientTreatmentStartDate(alignerJourney.getPatientTreatmentStartDate())
                .doctorTreatmentEndDate(alignerJourney.doctorTreatmentEndDate())
                .patientTreatmentEndDate(alignerJourney.patientTreatmentEndDate())
                .creationStatus(alignerJourney.getCreationStatus())
                .progressStatus(alignerJourney.getProgressStatus())
                .numbersOfDaysAlignersWornTillNow(alignerJourney.numbersOfDaysAlignersWorn(true, true, true))
                .dateDailyWearTimeRecords(dailyWearTimeStats)
                .wearTimeRecords(records)
                .build();
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CurrentAlignerStats {
        private int srNo;
        private long daysWorn;
        private float avgWearTimeInSec;
        private LocalDate startDate;
        private LocalDate endDate;
        private int noOfDaysToWear;
        private Compliance compliance;

        public static CurrentAlignerStats from(Aligner currentAligner) {
            if (currentAligner == null) return new CurrentAlignerStats();

            return CurrentAlignerStats.builder()
                    .srNo(currentAligner.getSrNo())
                    .avgWearTimeInSec(Optional.ofNullable(currentAligner.avgWearTimeInSecs(true, true))
                            .orElse(0f))
                    .daysWorn(currentAligner.noOfDaysWorn(false, true, true))
                    .startDate(currentAligner.getStartDate())
                    .endDate(currentAligner.getEndDate())
                    .noOfDaysToWear(currentAligner.getNoOfDaysToWear())
                    .compliance(currentAligner.compliance())
                    .build();
        }
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    private static class DailyWearTimeStats {
        private LocalDate date;
        private long wearTimeInSec;
        private int alignerSrNo;

        public static DailyWearTimeStats from(DailyAlignerWearTime dailyAlignerWearTime) {
            return new DailyWearTimeStats(
                    dailyAlignerWearTime.getDate(),
                    dailyAlignerWearTime.getTotalWearTimeSecs(),
                    dailyAlignerWearTime.getAligner().getSrNo());
        }

        public void plus(DailyAlignerWearTime r) {
            this.wearTimeInSec += r.getTotalWearTimeSecs();
        }

        public static void update(List<DailyWearTimeStats> stats, DailyAlignerWearTime dailyAlignerWearTime) {
            boolean got = false;
            for (var s : stats) {
                if (s.getAlignerSrNo() == dailyAlignerWearTime.getAligner().getSrNo()) {
                    s.plus(dailyAlignerWearTime);
                    got = true;
                    break;
                }
            }

            if (!got) {
                stats.add(DailyWearTimeStats.from(dailyAlignerWearTime));
            }
        }
    }
}
