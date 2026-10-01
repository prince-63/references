package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.treatment.entity.DailyAlignerWearTime;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DailyWearTimeDetails implements Serializable {
    private LocalDate date;
    private long totalWearTimeInSec;
    private long totalOutTimeInSec;
    private ZonedDateTime lastStatusChangedAt;

    public static DailyWearTimeDetails from(DailyAlignerWearTime dailyAlignerWearTime) {
        return DailyWearTimeDetails.builder()
                .date(dailyAlignerWearTime.getDate())
                .lastStatusChangedAt(dailyAlignerWearTime.getLastStatusChangedAt())
                .totalWearTimeInSec(dailyAlignerWearTime.getTotalWearTimeSecs())
                .totalOutTimeInSec(dailyAlignerWearTime.getTotalOutTimeSecs())
                .build();
    }
}
