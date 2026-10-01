package com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime;

import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WearTimeSession {
    private LocalTime inTime;
    private LocalTime outTime;
    private long durationSecs;
}
