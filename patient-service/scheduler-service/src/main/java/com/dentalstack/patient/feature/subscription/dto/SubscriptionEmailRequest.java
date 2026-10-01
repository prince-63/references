package com.dentalstack.patient.feature.subscription.dto;

import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubscriptionEmailRequest {
    private String practiceDisplayName;
    private String planName;
    private String email;

    private Integer patientLimit;
    private Double storageLimit;
    private ZonedDateTime date;

    private String whatsappNumber;

    private String currentPlan;

    private ZonedDateTime planStartDate;

    private ZonedDateTime planEndDate;

    private String requestType;
    private String remarks;

    private String patientOrOrder;
    private Integer userLimit;
    private String orgName;
}
