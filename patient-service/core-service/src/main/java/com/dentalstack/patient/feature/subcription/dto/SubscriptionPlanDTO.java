package com.dentalstack.patient.feature.subcription.dto;

import com.dentalstack.patient.feature.storage.migration.enums.DriveMigrationStatus;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionPlan;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionUserMapping;
import com.dentalstack.patient.feature.user.entity.UserProfile;
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
    private int usedManufacturings;
    private String brand;
    private PlanMetadata planMetadata;
    private long profileId;
    private boolean isAdmin;
    private boolean hasPlanStartedConsent;
    private boolean isTopUp;
    private Boolean isLabStaffDeactivated;
    private Boolean isPlanUpgraded;
    private Boolean isHasDonePractice;
    private Boolean isGDrivePlatformEnabled;
    private DriveMigrationStatus gDriveMigrationStatus;
    private Boolean isGDrivePlatformAuthenticated;

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

    public static SubscriptionPlanDTO from(SubscriptionPlan subscriptionPlan, UserProfile userProfile) {
        if (subscriptionPlan == null) {
            return null;
        }
        PlanName planName = null;
        if (userProfile.getPlan() != null && userProfile.getPlan().getName().equals("LITE_PLAN")) {
            planName = PlanName.LITE;
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
                        .planName(
                                planName != null
                                        ? planName
                                        : subscriptionPlan.getPlanMetadata().getPlanName())
                        .planType(subscriptionPlan.getPlanMetadata().getPlanType())
                        .requestDeletion(subscriptionPlan.getRequestedForDeactivation())
                        .build())
                .isHasDonePractice(subscriptionPlan.getIsDemoCompleted())
                .gDriveMigrationStatus(subscriptionPlan.getGDriveMigrationStatus())
                .isGDrivePlatformEnabled(subscriptionPlan.getIsGDrivePlatformEnabled())
                .isGDrivePlatformAuthenticated(subscriptionPlan.getIsGDrivePlatformAuthenticated())
                .build();
    }

    public static SubscriptionPlanDTO allSubscription(
            SubscriptionUserMapping subscriptionUserMapping, UserProfile userProfile) {
        SubscriptionPlan dto = subscriptionUserMapping.getSubscriptionPlan();
        PlanName planName = null;
        if (userProfile.getPlan() != null && userProfile.getPlan().getName().equals("LITE_PLAN")) {
            planName = PlanName.LITE;
        }
        return SubscriptionPlanDTO.builder()
                .id(dto.getId())
                .totalPatients(dto.getTotalPatients())
                .totalStorageGb(dto.getTotalStorageGb())
                .profileId(subscriptionUserMapping.getUserProfileId())
                .isAdmin(subscriptionUserMapping.getIsAdmin())
                .planMetadata(PlanMetadata.builder()
                        .isTrialPlan(dto.getPlanMetadata().isTrialPlan())
                        .nextBillingAt(dto.getPlanMetadata().getNextBillingAt())
                        .currentTermStart(dto.getPlanMetadata().getCurrentTermStart())
                        .currentTermEnd(dto.getPlanMetadata().getCurrentTermEnd())
                        .status(dto.getPlanMetadata().getStatus())
                        .planName(
                                planName != null
                                        ? planName
                                        : dto.getPlanMetadata().getPlanName())
                        .planType(dto.getPlanMetadata().getPlanType())
                        .requestDeletion(dto.getRequestedForDeactivation())
                        .build())
                .isHasDonePractice(dto.getIsDemoCompleted())
                .gDriveMigrationStatus(dto.getGDriveMigrationStatus())
                .isGDrivePlatformEnabled(dto.getIsGDrivePlatformEnabled())
                .isGDrivePlatformEnabled(dto.getIsGDrivePlatformEnabled())
                .isGDrivePlatformAuthenticated(dto.getIsGDrivePlatformAuthenticated())
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
        COMMERCIAL_LAB_PLAN,
        LITE
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
