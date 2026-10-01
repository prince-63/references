package com.dentalstack.patient.feature.calendar.dto.calendar.details;

import java.io.Serial;
import java.io.Serializable;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubscriptionCalendarDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private ZonedDateTime subscriptionExpiringAt;
    private boolean isTrialPlan;

    public static SubscriptionCalendarDetails from(ZonedDateTime subscriptionExpiringAt, boolean isTrialPlan) {
        return SubscriptionCalendarDetails.builder()
                .subscriptionExpiringAt(subscriptionExpiringAt)
                .isTrialPlan(isTrialPlan)
                .build();
    }
}
