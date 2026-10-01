package com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyWearTimeLogsResponse {
    private List<DailyWearTimeLogEntry> logs;
    private PaginationInfo pagination;
}
