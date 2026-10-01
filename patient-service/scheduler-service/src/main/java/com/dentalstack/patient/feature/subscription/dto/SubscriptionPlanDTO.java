package com.dentalstack.patient.feature.subscription.dto;

import com.dentalstack.patient.feature.subscription.entity.SubscriptionPlan;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubscriptionPlanDTO {
    private long id;
    private int totalPatients;
    private int totalUsedPatients;
    private double totalStorageGb;
    private double usedStorageGb;
    private int totalUsers;
    private int totalOrders;
    private int usedOrders;
    private String brand;
    private PlanMetadata planMetadata;
    private long profileId;
    private boolean isAdmin;
    private boolean hasPlanStartedConsent;
    private boolean isTopUp;
    private Boolean isLabStaffDeactivated;
    private Boolean isPlanUpgraded;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PlanMetadata {
        private boolean isTrialPlan;
        private ZonedDateTime nextBillingAt;
        private ZonedDateTime currentTermStart;
        private ZonedDateTime currentTermEnd;
        private PlanStatus status;
        private PlanName planName;
        private PlanType planType;
        private Boolean requestDeletion;
    }

    public static SubscriptionPlanDTO from(SubscriptionPlanDTO dto) {
        return SubscriptionPlanDTO.builder()
                .totalPatients(dto.getTotalPatients())
                .totalUsedPatients(dto.getTotalUsedPatients())
                .totalStorageGb(dto.getTotalStorageGb())
                .usedStorageGb(dto.getUsedStorageGb())
                .brand(dto.getBrand())
                .hasPlanStartedConsent(dto.isHasPlanStartedConsent())
                .planMetadata(PlanMetadata.builder()
                        .isTrialPlan(dto.getPlanMetadata().isTrialPlan())
                        .nextBillingAt(dto.getPlanMetadata().getNextBillingAt())
                        .currentTermStart(dto.getPlanMetadata().getCurrentTermStart())
                        .currentTermEnd(dto.getPlanMetadata().getCurrentTermEnd())
                        .status(dto.getPlanMetadata().getStatus())
                        .planName(dto.getPlanMetadata().getPlanName())
                        .planType(dto.getPlanMetadata().getPlanType())
                        .build())
                .isPlanUpgraded(dto.getIsPlanUpgraded())
                .build();
    }

    public static SubscriptionPlanDTO from(SubscriptionPlan subscriptionPlan) {
        if (subscriptionPlan == null) {
            return null;
        }
        return SubscriptionPlanDTO.builder()
                .id(subscriptionPlan.getId())
                .totalPatients(subscriptionPlan.getTotalPatients())
                .totalStorageGb(subscriptionPlan.getTotalStorageGb())
                .totalOrders(subscriptionPlan.getTotalOrders() != null ? subscriptionPlan.getTotalOrders() : 0)
                .hasPlanStartedConsent(subscriptionPlan.getHasPlanStartedConsent() != null
                        && subscriptionPlan.getHasPlanStartedConsent())
                .planMetadata(PlanMetadata.builder()
                        .isTrialPlan(subscriptionPlan.getPlanMetadata().isTrialPlan())
                        .nextBillingAt(subscriptionPlan.getPlanMetadata().getNextBillingAt())
                        .currentTermStart(subscriptionPlan.getPlanMetadata().getCurrentTermStart())
                        .currentTermEnd(subscriptionPlan.getPlanMetadata().getCurrentTermEnd())
                        .status(subscriptionPlan.getPlanMetadata().getStatus())
                        .planName(subscriptionPlan.getPlanMetadata().getPlanName())
                        .planType(subscriptionPlan.getPlanMetadata().getPlanType())
                        .build())
                .build();
    }

    public enum PlanName {
        STUDENT,
        STARTER,
        GROWTH,
        PROFESSIONAL,
        ENTERPRISE,
        DESIGN_LAB,
        BUSINESS,
        VENDOR,
        COMMERCIAL_LAB_PLAN
    }

    public enum PlanType {
        MONTHLY,
        YEARLY,
        TRIAL
    }

    public enum PlanStatus {
        ACTIVE,
        INACTIVE,
        EXPIRED
    }
}
