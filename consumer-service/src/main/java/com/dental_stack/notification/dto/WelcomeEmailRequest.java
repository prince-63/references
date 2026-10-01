package com.dental_stack.notification.dto;

import com.dental_stack.notification.enums.DoctorRole;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WelcomeEmailRequest {
    private String doctorFirstName;
    private String trialPlanName;
    private Integer trialDuration;
    private Double trialStorage;
    private ZonedDateTime trialExpiryDate;
    private Integer totalValue;
    private String doctorEmail;
    private String orgName;
    private DoctorRole doctorRole;
    private String companyName;
}
