package com.dentalstack.patient.feature.rbac.dto.response;

import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.rbac.projection.InvitationSummaryProjection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccessControlUserResponse {
    private String firstName;
    private String lastName;
    private String email;
    private String mobileNumber;
    private String profileImageUrl;
    private Long profileImageId;
    private String salutation;
    private String subRoleName;
    private InvitationStatus invitationStatus;
    private Long invitationId;
    private String countryCode;
    private Long subRoleId;
    private String inviteCode;
    private Long profileId;

    public static AccessControlUserResponse mapToAccessControlUserResponse(InvitationSummaryProjection projection) {
        return AccessControlUserResponse.builder()
                .firstName(projection.getFirstName())
                .lastName(projection.getLastName())
                .profileImageId(projection.getProfileImageId())
                .profileImageUrl(projection.getProfileImageUrl())
                .email(projection.getEmail())
                .mobileNumber(projection.getMobileNumber())
                .salutation(projection.getSalutation())
                .subRoleName(projection.getSubRoleName())
                .invitationStatus(projection.getInvitationStatus())
                .invitationId(projection.getInvitationId())
                .inviteCode(projection.getInviteCode())
                .subRoleId(projection.getSubRoleId())
                .countryCode(projection.getCountryCode().getCode())
                .build();
    }
}
