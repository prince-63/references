package com.dentalstack.patient.feature.subcription.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.ZonedDateTime;
import lombok.*;

@Entity
@Table(name = "subscription_account_upgrade")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionAccountUpgrade extends BaseEntity {
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
