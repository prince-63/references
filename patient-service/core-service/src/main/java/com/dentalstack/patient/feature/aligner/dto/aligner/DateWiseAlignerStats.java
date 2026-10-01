package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
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
public class DateWiseAlignerStats {
    private int alignerNo;
    private Long alignerJourneyId;
    private Float alignerJourneyAvgWearTime;

    private Float alignerAvgWearTime;
    private Integer recommendedHoursToWearAligners;
    private Compliance alignerCompliance;
    private Compliance currentAlignerCompliance;
    private JawType currentAlignerJawType;
    private Integer currentAlignerNo;

    private ComplianceDetails complianceDetails;
    private float complianceRate;
    private Long untrackedDays;
    private Long ghostLogs;

    @Builder.Default
    private List<DailyWearTimeDetails> dailyWearTimeDetails = new ArrayList<>();

    public static DateWiseAlignerStats from(
            AlignerJourney alignerJourney,
            Aligner aligner,
            LocalDate startDate,
            LocalDate endDate,
            Long untrackedDays,
            Long ghostLogs) {
        Aligner currentAligner = alignerJourney.getCurrentAligner();
        Compliance currentAlignerCompliance = null;
        JawType currentAlignerJawType = null;
        Integer currentAlignerNo = null;
        if (currentAligner != null) {
            currentAlignerCompliance = currentAligner.compliance();
            currentAlignerJawType = currentAligner.getJawType();
            currentAlignerNo = currentAligner.getSrNo();
        }

        Set<LocalDate> gotDate = new HashSet<>();
        var records = new ArrayList<DailyWearTimeDetails>();
        for (var r : aligner.getDailyWearTimeRecords()) {
            var date = r.getDate();
            if (date.isBefore(startDate) || date.isAfter(endDate)) continue;
            records.add(DailyWearTimeDetails.from(r));
            gotDate.add(date);
        }

        for (var date = startDate; date.isBefore(endDate.plusDays(1)); date = date.plusDays(1)) {
            if (gotDate.contains(date)) continue;

            records.add(new DailyWearTimeDetails(date, 0, 0, null));
            gotDate.add(date);
        }
        records.sort(Comparator.comparing(DailyWearTimeDetails::getDate));

        float avgWearTimeHours =
                Optional.ofNullable(aligner.avgWearTimeInSecs(true, true)).orElse(0f) / 3600f;

        float complianceRate = (avgWearTimeHours / alignerJourney.getRecommendedHoursToWearAligners()) * 100;

        return DateWiseAlignerStats.builder()
                .alignerJourneyId(alignerJourney.getId())
                .alignerJourneyAvgWearTime(alignerJourney.avgWearTimeInSecs())
                .alignerNo(aligner.getSrNo())
                .alignerAvgWearTime(Optional.ofNullable(aligner.avgWearTimeInSecs(true, true))
                        .orElse(0f))
                .recommendedHoursToWearAligners(alignerJourney.getRecommendedHoursToWearAligners())
                .alignerCompliance(aligner.compliance())
                .currentAlignerCompliance(currentAlignerCompliance)
                .complianceDetails(ComplianceDetails.from(alignerJourney))
                .currentAlignerJawType(currentAlignerJawType)
                .currentAlignerNo(currentAlignerNo)
                .dailyWearTimeDetails(records)
                .complianceRate(complianceRate)
                .untrackedDays(untrackedDays)
                .ghostLogs(ghostLogs)
                .build();
    }
}
