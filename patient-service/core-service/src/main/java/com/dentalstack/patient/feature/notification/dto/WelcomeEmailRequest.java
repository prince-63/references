package com.dentalstack.patient.feature.notification.dto;

import com.dentalstack.patient.feature.doctor.entity.Doctor;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.subcription.constant.SubscriptionConstant;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionPlan;
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

    public static WelcomeEmailRequest from(
            SubscriptionPlan subscriptionPlan, Doctor doctor, DoctorRole doctorRole, UserProfile userProfile) {
        return WelcomeEmailRequest.builder()
                .doctorFirstName(doctor.getDoctorFirstName())
                .trialPlanName(String.valueOf(subscriptionPlan.getPlanMetadata().getPlanName()))
                .trialDuration(SubscriptionConstant.PLAN_TRIAL_DAYS)
                .trialStorage(subscriptionPlan.getTotalStorageGb())
                .trialExpiryDate(subscriptionPlan.getPlanMetadata().getCurrentTermEnd())
                .totalValue(subscriptionPlan.getTotalPatients())
                .doctorEmail(doctor.getEmail())
                .orgName(userProfile.getOrgName())
                .doctorRole(doctorRole)
                .companyName(userProfile.getOrganizationBrandName())
                .build();
    }
}
