package com.dentalstack.patient.feature.aligner.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import lombok.*;

@Entity
@Table(
        name = "aligner_daily_wear_time",
        indexes = {
            @Index(name = "IX_daily_aligner_wear_time_aligner_id", columnList = "aligner_id"),
            @Index(name = "IX_daily_aligner_wear_time_date", columnList = "date"),
            @Index(name = "IX_daily_aligner_wear_time_last_status_changed_at", columnList = "lastStatusChangedAt")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyAlignerWearTime extends BaseEntity {
    @NotNull
    private LocalDate date;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aligner_id")
    private Aligner aligner;

    private long totalWearTimeSecs;

    private long totalOutTimeSecs;

    @NotNull
    private ZonedDateTime lastStatusChangedAt;

    public static DailyAlignerWearTime newRecord(LocalDate date, Aligner aligner) {
        ZonedDateTime nowZoned = ZonedDateTime.now();
        Instant midnight =
                nowZoned.toLocalDate().atStartOfDay(nowZoned.getZone()).toInstant();
        Duration duration = Duration.between(midnight, Instant.now());
        long seconds = duration.getSeconds();

        return DailyAlignerWearTime.builder()
                .date(date)
                .aligner(aligner)
                .totalWearTimeSecs(0)
                .totalOutTimeSecs(seconds)
                .lastStatusChangedAt(nowZoned)
                .build();
    }

    public void updateStatus(long wearDurationInSec) {
        long secsTillNow = 86400L;

        totalWearTimeSecs = wearDurationInSec;
        totalOutTimeSecs = secsTillNow - totalWearTimeSecs;
    }
}
