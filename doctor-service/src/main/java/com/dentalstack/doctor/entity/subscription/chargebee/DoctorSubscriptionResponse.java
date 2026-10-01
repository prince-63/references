package com.dentalstack.doctor.entity.subscription.chargebee;

import com.dentalstack.doctor.constant.SubscriptionConstant;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorSubscriptionResponse {
    private int totalPatients;
    private int totalUsedPatients;
    private double totalStorageGb;
    private double usedStorageGb;
    private CurrentPlanDetails currentPlanDetails;
    private boolean trialAboutToExpire;
    private boolean trialPlanStarted;
    private PlanUpgradeFlags planUpgradeFlags;
    private long eventId;
    private boolean isSubscriptionExtended;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CurrentPlanDetails {
        private ZonedDateTime nextBillingAt;
        private ZonedDateTime currentTermStart;
        private ZonedDateTime currentTermEnd;
        private String status;
        private String planName;
        private String planType;
        private List<SubscriptionItemDetails> subscriptionItems;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class SubscriptionItemDetails {
        private int amount;
        private String object;
        private String itemType;
        private int quantity;
        private int unitPrice;
        private int freeQuantity;
        private String itemPriceId;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PlanUpgradeFlags {
        private boolean storage;
        private boolean patients;
        private boolean dashboard;
    }

    public static DoctorSubscriptionResponse from(ChargebeeEvent chargebeeEvent, long totalPatientUsed) {
        ChargebeeEventContent content = chargebeeEvent.getContent();
        ChargebeeEventContent.Subscription subscription = content.getSubscription();

        CurrentPlanDetails currentPlanDetails = null;
        int totalPatients = 0;
        String planName;
        int totalStorageGb = 0;
        boolean isTrialPlan = false;

        if (subscription != null && subscription.getSubscriptionItems() != null) {
            totalStorageGb = calculateTotalStorage(subscription.getSubscriptionItems());

            List<SubscriptionItemDetails> subscriptionItemDetails = Arrays.stream(subscription.getSubscriptionItems())
                    .map(item -> SubscriptionItemDetails.builder()
                            .amount(item.getAmount())
                            .object(item.getObject())
                            .itemType(item.getItemType())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .freeQuantity(item.getFreeQuantity())
                            .itemPriceId(item.getItemPriceId())
                            .build())
                    .collect(Collectors.toList());

            if (!subscriptionItemDetails.isEmpty()) {
                var details = subscriptionItemDetails.get(0);
                totalPatients = details.getQuantity();
            }

            String planType = null;
            String status = subscription.getStatus();

            if (!subscriptionItemDetails.isEmpty()) {
                var details = subscriptionItemDetails.get(0);
                totalPatients = details.getQuantity();
                planType = details.getItemPriceId();
            }

            if (SubscriptionConstant.STATUS_IN_TRIAL.equals(status)) {
                status = SubscriptionConstant.STATUS_TRIAL;
                planName = SubscriptionConstant.PLAN_TRIAL;
                planType = SubscriptionConstant.PLAN_TRIAL;
            } else {
                if (SubscriptionConstant.STATUS_ACTIVE.equals(status)) {
                    status = SubscriptionConstant.STATUS_ACTIVE_UPPER;
                }
                if (SubscriptionConstant.PLAN_BASIC_MONTHLY.equals(planType)
                        || SubscriptionConstant.PLAN_BASIC_YEARLY.equals(planType)) {
                    planName = SubscriptionConstant.PLAN_BASIC;
                    planType = SubscriptionConstant.PLAN_BASIC;
                } else {
                    planName = planType;
                }
            }
            if (SubscriptionConstant.STATUS_IN_FREE_TRIAL.equals(planType)) {
                status = SubscriptionConstant.STATUS_TRIAL;
                planName = SubscriptionConstant.PLAN_TRIAL;
                planType = SubscriptionConstant.PLAN_TRIAL;
            }

            if (planType.startsWith(SubscriptionConstant.ENTERPRISE)) {
                planName = SubscriptionConstant.ENTERPRISE;
                planType = SubscriptionConstant.ENTERPRISE;
            } else if (planType.equals(SubscriptionConstant.ENTERPRISE_USD_MONTHLY)
                    || planType.equals(SubscriptionConstant.ENTERPRISE_INR_MONTHLY)
                    || planType.equals(SubscriptionConstant.ENTERPRISE_INR_YEARLY)) {
                planName = SubscriptionConstant.ENTERPRISE;
                planType = SubscriptionConstant.ENTERPRISE;
            }
            currentPlanDetails = CurrentPlanDetails.builder()
                    .nextBillingAt(
                            subscription.getNextBillingAt() != 0
                                    ? Instant.ofEpochSecond(subscription.getNextBillingAt())
                                            .atZone(ZoneId.systemDefault())
                                    : null)
                    .currentTermStart(
                            chargebeeEvent.getSubscriptionStartDate() != null
                                    ? chargebeeEvent.getSubscriptionStartDate()
                                    : null)
                    .currentTermEnd(
                            chargebeeEvent.getSubscriptionEndDate() != null
                                    ? chargebeeEvent.getSubscriptionEndDate()
                                    : null)
                    .status(status)
                    .planName(planName)
                    .planType(planType)
                    .subscriptionItems(subscriptionItemDetails)
                    .build();
            if (status.equalsIgnoreCase(SubscriptionConstant.STATUS_IN_TRIAL)
                    || status.equalsIgnoreCase(SubscriptionConstant.STATUS_IN_FREE_TRIAL)) {
                isTrialPlan = true;
            }
        }

        ZonedDateTime now = ZonedDateTime.now();

        return DoctorSubscriptionResponse.builder()
                .totalPatients(totalPatients)
                .totalUsedPatients((int) totalPatientUsed)
                .totalStorageGb(totalStorageGb)
                .usedStorageGb(0.0)
                .currentPlanDetails(currentPlanDetails)
                .eventId(chargebeeEvent.getId())
                .build();
    }

    private static int calculateTotalStorage(ChargebeeEventContent.Subscription.SubscriptionItem[] subscriptionItems) {
        return Arrays.stream(subscriptionItems)
                .filter(item -> SubscriptionConstant.ADD_ON.equals(item.getItemType())
                        && (SubscriptionConstant.MONTHLY.equals(item.getItemPriceId())
                                || SubscriptionConstant.YEARLY.equals(item.getItemPriceId())))
                .mapToInt(ChargebeeEventContent.Subscription.SubscriptionItem::getQuantity)
                .sum();
    }
}
