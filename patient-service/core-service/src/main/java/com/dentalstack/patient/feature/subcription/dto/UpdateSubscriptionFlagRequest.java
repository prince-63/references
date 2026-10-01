package com.dentalstack.patient.feature.subcription.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateSubscriptionFlagRequest {
    private Boolean patientUpgraded;
    private Boolean storageUpdate;
    private Boolean dashboardCardViewed;
    private Boolean trialPlanStarted;
    private Boolean trialAboutToExpire;
    private long doctorId;
}
