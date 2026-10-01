package com.dentalstack.patient.feature.subcription.dto;

import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpgradeSubscription {
    private Long doctorId;
    private Long profileId;

    private Boolean isTrial;
    private SubscriptionPlanDTO.PlanName planName;
    private String authCode;

    private Integer totalPatients;
    private Double totalStorageGb;
    private Integer totalUsers;
    private Integer totalOrders;

    private SubscriptionPlanDTO.PlanType planType;

    private ZonedDateTime nextBillingAt;
    private ZonedDateTime currentTermStart;
    private ZonedDateTime currentTermEnd;
}
