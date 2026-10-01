package com.dentalstack.patient.feature.rewards.service.impl;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.DailyAlignerWearTime;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AlignerWearStatsHelper {

    private static final float REQUIRED_HOURS_PER_DAY = 15.0f;
    private static final long SECONDS_IN_HOUR = 3600L;

    public WearTimeStats calculateWearTimeStats(Aligner currentAligner, int daysToCheck) {
        if (currentAligner == null) {
            return WearTimeStats.builder()
                    .consecutiveDaysCompleted(0)
                    .todayWearTimeInHours(0f)
                    .remainingHoursToday(REQUIRED_HOURS_PER_DAY)
                    .isTodayCompleted(false)
                    .build();
        }

        LocalDate today = LocalDate.now();
        List<DailyAlignerWearTime> wearRecords = currentAligner.getDailyWearTimeRecords();

        float todayWearTimeInHours = getTodayWearTimeInHours(wearRecords, today);
        boolean isTodayCompleted = todayWearTimeInHours >= REQUIRED_HOURS_PER_DAY;
        float remainingHoursToday = Math.max(0, REQUIRED_HOURS_PER_DAY - todayWearTimeInHours);

        int consecutiveDays = calculateConsecutiveDaysStreak(wearRecords, today, daysToCheck);

        return WearTimeStats.builder()
                .consecutiveDaysCompleted(consecutiveDays)
                .todayWearTimeInHours(todayWearTimeInHours)
                .remainingHoursToday(remainingHoursToday)
                .isTodayCompleted(isTodayCompleted)
                .currentAlignerNo(currentAligner.getSrNo())
                .build();
    }

    private float getTodayWearTimeInHours(List<DailyAlignerWearTime> wearRecords, LocalDate today) {
        return wearRecords.stream()
                .filter(record -> record.getDate().equals(today))
                .findFirst()
                .map(record -> record.getTotalWearTimeSecs() / (float) SECONDS_IN_HOUR)
                .orElse(0f);
    }

    private int calculateConsecutiveDaysStreak(
            List<DailyAlignerWearTime> wearRecords, LocalDate today, int maxDaysToCheck) {

        int consecutiveDays = 0;
        LocalDate checkDate = today.minusDays(1);

        for (int i = 0; i < maxDaysToCheck; i++) {
            final LocalDate dateToCheck = checkDate;

            boolean dayCompleted = wearRecords.stream()
                    .filter(record -> record.getDate().equals(dateToCheck))
                    .findFirst()
                    .map(record -> {
                        float hours = record.getTotalWearTimeSecs() / (float) SECONDS_IN_HOUR;
                        return hours >= REQUIRED_HOURS_PER_DAY;
                    })
                    .orElse(false);

            if (dayCompleted) {
                consecutiveDays++;
                checkDate = checkDate.minusDays(1);
            } else {

                break;
            }
        }

        return consecutiveDays;
    }

    public boolean isDailyWearTaskClaimable(WearTimeStats stats, boolean isAlreadyCompleted) {
        if (isAlreadyCompleted) {
            return false;
        }
        return stats.isTodayCompleted();
    }

    public boolean isStreakMilestoneClaimable(WearTimeStats stats, int requiredStreak, boolean isAlreadyCompleted) {

        if (isAlreadyCompleted) {
            return false;
        }

        return stats.getConsecutiveDaysCompleted() >= requiredStreak && stats.isTodayCompleted();
    }

    @Data
    @Builder
    public static class WearTimeStats {
        private int consecutiveDaysCompleted;
        private float todayWearTimeInHours;
        private float remainingHoursToday;
        private boolean isTodayCompleted;
        private Integer currentAlignerNo;
    }
}
