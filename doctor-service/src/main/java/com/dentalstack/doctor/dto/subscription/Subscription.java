package com.dentalstack.doctor.dto.subscription;

import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Subscription {
    private long id;
    private int totalPatients;
    private int totalStorageGb;
    private PlanMetadata planMetadata;
    private long profileId;
    private boolean isAdmin;

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
        private Long requestDeletion;
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
