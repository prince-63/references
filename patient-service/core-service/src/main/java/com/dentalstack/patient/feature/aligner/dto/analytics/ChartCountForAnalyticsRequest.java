package com.dentalstack.patient.feature.aligner.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChartCountForAnalyticsRequest {
    private Long profileId;
    private Long organizationId;
    private Long doctorId;
    private Compliance filter;

    private enum Compliance {
        NEED_ATTENTION,
        AT_RISK,
        ON_TRACK,
        ALL
    }
}
