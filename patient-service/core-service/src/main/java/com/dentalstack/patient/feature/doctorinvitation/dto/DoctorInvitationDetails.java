package com.dentalstack.patient.feature.doctorinvitation.dto;

import com.dentalstack.patient.feature.billing.entity.DoctorBilling;
import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctorinvitation.entity.DoctorInvitation;
import com.dentalstack.patient.feature.doctorinvitation.enums.CredentialType;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationRole;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.doctorinvitation.enums.UserRegistrationType;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorInvitationDetails {

    private String doctorName;

    private String practiceLocation;

    private String doctorEmail;

    private Long doctorId;

    private long invitationId;

    private String doctorImage;

    private String firstName;
    private String lastName;
    private String email;
    private String countryCode;
    private String mobileNo;
    private Long organizationId;
    private Long profileId;
    private String organizationName;
    private String organizationProfileUrl;
    private List<InvitationRole> invitationRole;
    private String salutation;
    private String invitationCode;
    private ZonedDateTime invitedAt;
    private ZonedDateTime lastInvitationAt;
    private InvitationStatus status;
    private String profileUrl;

    private UserRegistrationType registrationType;

    private ZonedDateTime expiresAt;
    private ZonedDateTime acceptedAt;
    private boolean isAdmin;
    private String displayName;
    private InvitationRole role;
    private Boolean isReceivedInvitation;
    private CredentialType credentialType;
    private String orgName;
    private Long subRoleId;

    public static DoctorInvitationDetails from(DoctorDetails doctorDetails, Invitation invitation) {
        assert invitation.getPatientInvitation() != null;
        return DoctorInvitationDetails.builder()
                .doctorName(doctorDetails.getFirstName() + " " + doctorDetails.getLastName())
                .practiceLocation(invitation.getPatientInvitation().getPracticeLocation())
                .doctorEmail(doctorDetails.getEmail())
                .doctorId(doctorDetails.getDoctorId())
                .invitationId(invitation.getId())
                .doctorImage((doctorDetails.getDoctorImage()))
                .build();
    }

    public static DoctorInvitationDetails from(DoctorInvitation doctorInvitation) {
        return DoctorInvitationDetails.builder()
                .firstName(doctorInvitation.getFirstName())
                .lastName(doctorInvitation.getLastName())
                .email(doctorInvitation.getEmail())
                .countryCode(
                        doctorInvitation.getCountryCode() != null
                                ? doctorInvitation.getCountryCode().getCode()
                                : null)
                .mobileNo(doctorInvitation.getMobileNo())
                .organizationId(doctorInvitation.getOrganization().getId())
                .invitationRole(doctorInvitation.getInvitationRole())
                .role(doctorInvitation.getRoles())
                .salutation(doctorInvitation.getSalutation())
                .invitationCode(doctorInvitation.getDoctorInvitationCode().getCode())
                .invitedAt(doctorInvitation.getInvitedAt())
                .lastInvitationAt(doctorInvitation.getLastInvitationAt())
                .status(doctorInvitation.getStatus())
                .registrationType(doctorInvitation.getRegistrationType())
                .expiresAt(doctorInvitation.getExpiresAt())
                .acceptedAt(doctorInvitation.getAcceptedAt())
                .organizationName(doctorInvitation.getInviterUserProfile().getOrgName())
                .organizationProfileUrl(Optional.ofNullable(doctorInvitation.getInviterUserProfile())
                        .map(UserProfile::getDoctorBilling)
                        .map(DoctorBilling::getCompanyImageUrl)
                        .orElse(null))
                .invitationId(doctorInvitation.getId())
                .doctorId(
                        doctorInvitation.getInvitedDoctor() != null
                                ? doctorInvitation.getInvitedDoctor().getId()
                                : null)
                .profileUrl(
                        doctorInvitation.getInvitedDoctor() != null
                                ? doctorInvitation.getInvitedDoctor().getProfileImage()
                                : null)
                .isAdmin(false)
                .subRoleId(
                        doctorInvitation.getAssignedSubRole() != null
                                ? doctorInvitation.getAssignedSubRole().getId()
                                : null)
                .build();
    }
}
