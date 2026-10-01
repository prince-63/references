package com.dentalstack.patient.feature.aligner.dto.analytics;

import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import jakarta.annotation.Nullable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlignerPatientAnalyticsDetailsRequest {
    private Long doctorId;
    private Long organizationId;
    private Long profileId;
    private Integer pageNumber;
    private Integer pageSize;
    private String search;
    private Compliance filter;
    private Boolean isAlignerPendingUpdates;
    private AppInviteStatus patientInvitationStatus;

    @Nullable
    private List<Long> practiceProfileIds;

    @Nullable
    private List<Long> practiceLocationIds;

    private enum Compliance {
        NEED_ATTENTION,
        AT_RISK,
        ON_TRACK,
        ALL
    }
}
