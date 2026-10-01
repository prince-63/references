package com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyWearTimeLogEntry {
    private LocalDate date;
    private long totalDurationSecs;
    private List<WearTimeSession> sessions;
}
