package com.dentalstack.doctor.dto.profile;

import com.dentalstack.doctor.entity.user.UserProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorsProfileResponse {

    private Long organizationId;
    private String organizationName;
    private Long profileId;
    private Long doctorId;
    private String userName;
    private String doctorEmail;
    private Boolean isSubscriptionPlanActive;
    private String subscriptionPlanName;

    public static DoctorsProfileResponse from(UserProfile up) {
        return DoctorsProfileResponse.builder()
                .organizationId(
                        up.getOrganization() != null ? up.getOrganization().getId() : null)
                .organizationName(
                        up.getOrganization() != null ? up.getOrganization().getName() : null)
                .profileId(up.getId())
                .doctorId(up.getDoctor() != null ? up.getDoctor().getId() : null)
                .userName(up.getUser() != null ? up.getUser().displayName() : null)
                .doctorEmail(up.getDoctor() != null ? up.getDoctor().getEmail() : null)
                .build();
    }
}
