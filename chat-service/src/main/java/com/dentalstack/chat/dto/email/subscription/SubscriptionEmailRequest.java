package com.dentalstack.chat.dto.email.subscription;

import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionEmailRequest {
    private String practiceDisplayName;
    private String planName;
    private String email;
    private String patientOrOrder;
    private Integer userLimit;
    private Double storageLimit;
    private ZonedDateTime planStartDate;
    private ZonedDateTime planEndDate;

    private ZonedDateTime date;
    private String whatsappNumber;
    private String currentPlan;
    private String requestType;
    private String remarks;
    private String orgName;
}
