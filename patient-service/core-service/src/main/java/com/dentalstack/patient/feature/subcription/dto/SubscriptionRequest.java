package com.dentalstack.patient.feature.subcription.dto;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import jakarta.annotation.Nullable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubscriptionRequest {

    private String firstName;

    @Nullable
    private String lastName;

    @Nullable
    private String phone;

    @Nullable
    private String email;

    private Long doctorId;

    private Long userProfileId;

    private List<DoctorRole> roles;

    private Long inviterId;

    private Long inviterProfileId;
    private Long newProfileId;
    private Boolean isProfileCreating;
    private String invitationCode;

    private Long organizationId;

    private String xOrgName;
}
