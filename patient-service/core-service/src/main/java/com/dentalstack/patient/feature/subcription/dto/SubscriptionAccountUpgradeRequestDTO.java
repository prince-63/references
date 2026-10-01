package com.dentalstack.patient.feature.subcription.dto;

import com.dentalstack.patient.global.enums.CountryCode;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubscriptionAccountUpgradeRequestDTO {
    private Long doctorId;
    private Long profileId;
    private String userName;
    private String userEmail;
    private CountryCode countryCode;
    private String mobile;
    private String currentPlanName;
    private ZonedDateTime currentPlanStartDate;
    private ZonedDateTime currentPlanEndDate;
    private String requestType;
    private String newPlanName;
    private String notes;
}
