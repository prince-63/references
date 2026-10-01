package com.dentalstack.doctor.dto.invitation;

import com.dentalstack.doctor.entity.billing.DoctorBilling;
import com.dentalstack.doctor.entity.invitation.DoctorInvitation;
import com.dentalstack.doctor.entity.rbac.SubRole;
import com.dentalstack.doctor.entity.user.User;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.auth.CredentialType;
import com.dentalstack.doctor.enums.invitation.InvitationRole;
import com.dentalstack.doctor.enums.invitation.InvitationStatus;
import com.dentalstack.doctor.enums.invitation.UserRegistrationType;
import com.dentalstack.doctor.enums.rbac.SubRoleTag;
import com.dentalstack.doctor.summary.UserProfileSummary;
import jakarta.annotation.Nullable;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorInvitationDetails {

    private String firstName;
    private String lastName;
    private String email;
    private String countryCode;
    private String mobileNo;
    private Long organizationId;
    private Long doctorId;
    private Long profileId;
    private String organizationName;
    private String organizationProfileUrl;
    private Long organizationProfileImageId;
    private List<InvitationRole> invitationRole;
    private String salutation;
    private String invitationCode;
    private ZonedDateTime invitedAt;
    private ZonedDateTime lastInvitationAt;
    private InvitationStatus status;
    private String profileUrl;
    private Long profileImageId;
    private Long invitationId;

    private UserRegistrationType registrationType;

    private ZonedDateTime expiresAt;
    private ZonedDateTime acceptedAt;
    private boolean isAdmin;
    private String displayName;
    private InvitationRole role;
    private Boolean isReceivedInvitation;
    private CredentialType credentialType;
    private String orgName;
    private String subRoleName;
    private SubRoleTag subRoleTag;
    private Boolean isTrackingEnabled;
    private Boolean isStlFileViewEnabled;
    private Boolean isScanFileViewEnabled;
    private Boolean isPrintFileViewEnabled;
    private List<String> enabledItems;
    private String brand;
    //    private SubRoleResponse subRoleResponse;

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
                .organizationName(doctorInvitation.getInviterUserProfile().getUserProfileOrgName())
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
                //                .subRoleResponse(
                //                        doctorInvitation.getAssignedSubRole() != null
                //                                ? SubRoleResponse.from(doctorInvitation.getAssignedSubRole())
                //                                : null)
                .subRoleName(
                        doctorInvitation.getAssignedSubRole() != null
                                ? doctorInvitation.getAssignedSubRole().getName()
                                : null)
                .subRoleTag(
                        doctorInvitation.getAssignedSubRole() != null
                                ? doctorInvitation.getAssignedSubRole().getSubRoleTag()
                                : null)
                .isTrackingEnabled(doctorInvitation.getIsTrackingEnabled())
                .isPrintFileViewEnabled(doctorInvitation.getIsPrintFileViewEnabled())
                .isScanFileViewEnabled(doctorInvitation.getIsScanFileViewEnabled())
                .isStlFileViewEnabled(doctorInvitation.getIsStlFileViewEnabled())
                .build();
    }

    public static DoctorInvitationDetails fromInvitation(
            DoctorInvitation doctorInvitation, CredentialType credentialType, SubRole subRole, String brand) {

        DoctorBilling billing = doctorInvitation.getInviterUserProfile().getDoctorBilling();
        String organizationProfileUrl = null;
        if (billing != null) {
            organizationProfileUrl = billing.getCompanyBrandProfilePicture() != null
                    ? billing.getCompanyBrandProfilePicture()
                    : billing.getCompanyImageUrl();
        }
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
                .organizationName(
                        doctorInvitation.getInviterUserProfile().getDoctorBilling() != null
                                ? doctorInvitation
                                        .getInviterUserProfile()
                                        .getDoctorBilling()
                                        .getCompanyBrandName()
                                : doctorInvitation.getInviterUserProfile().getUserProfileOrgName())
                .organizationProfileUrl(organizationProfileUrl)
                .doctorId(
                        doctorInvitation.getInvitedDoctor() != null
                                ? doctorInvitation.getInvitedDoctor().getId()
                                : null)
                .profileUrl(
                        doctorInvitation.getInvitedDoctor() != null
                                ? doctorInvitation.getInvitedDoctor().getProfileImage()
                                : null)
                .isAdmin(false)
                .credentialType(credentialType)
                .brand(brand)
                //                .subRoleResponse(subRole != null ? SubRoleResponse.from(subRole) : null)
                .build();
    }

    public static DoctorInvitationDetails from(
            DoctorInvitation doctorInvitation, @Nullable UserProfileSummary userProfile) {

        String lastName = userProfile != null ? userProfile.getLastName() : "";

        return DoctorInvitationDetails.builder()
                .firstName(userProfile != null ? userProfile.getFirstName() : doctorInvitation.getFirstName())
                .lastName(userProfile != null ? lastName : doctorInvitation.getLastName())
                .email(doctorInvitation.getEmail())
                .countryCode(
                        doctorInvitation.getCountryCode() != null
                                ? doctorInvitation.getCountryCode().getCode()
                                : null)
                .mobileNo(userProfile != null ? userProfile.getMobileNo() : doctorInvitation.getMobileNo())
                .organizationId(doctorInvitation.getOrganization().getId())
                .invitationRole(doctorInvitation.getInvitationRole())
                .role(doctorInvitation.getRoles())
                .salutation(userProfile != null ? userProfile.getSalutation() : doctorInvitation.getSalutation())
                .invitationCode(doctorInvitation.getDoctorInvitationCode().getCode())
                .invitedAt(doctorInvitation.getInvitedAt())
                .lastInvitationAt(doctorInvitation.getLastInvitationAt())
                .status(doctorInvitation.getStatus())
                .registrationType(doctorInvitation.getRegistrationType())
                .expiresAt(doctorInvitation.getExpiresAt())
                .acceptedAt(doctorInvitation.getAcceptedAt())
                .organizationName(doctorInvitation.getInviterUserProfile().getUserProfileOrgName())
                .organizationProfileUrl(Optional.ofNullable(doctorInvitation.getInviterUserProfile())
                        .map(UserProfile::getUser)
                        .map(User::displayPicture)
                        .orElse(null))
                .organizationProfileImageId(userProfile != null ? userProfile.getDisplayPictureId() : null)
                .invitationId(doctorInvitation.getId())
                .doctorId(
                        doctorInvitation.getInvitedDoctor() != null
                                ? doctorInvitation.getInvitedDoctor().getId()
                                : null)
                .profileId(userProfile != null ? userProfile.getProfileId() : null)
                .profileUrl(userProfile != null ? userProfile.getProfilePicture() : null)
                .profileImageId(userProfile != null ? userProfile.getProfilePictureId() : null)
                .isAdmin(false)
                .displayName(
                        userProfile != null && userProfile.getEffectiveDisplayName() != null
                                ? userProfile.getEffectiveDisplayName()
                                : doctorInvitation.getFirstName()
                                        + (doctorInvitation.getLastName() != null
                                                ? " " + doctorInvitation.getLastName()
                                                : ""))
                .orgName(
                        userProfile != null && userProfile.getCompanyBrandName() != null
                                ? userProfile.getCompanyBrandName()
                                : null)
                //                .subRoleResponse(
                //                        doctorInvitation.getAssignedSubRole() != null
                //                                ? SubRoleResponse.from(doctorInvitation.getAssignedSubRole())
                //                                : null)
                .subRoleName(
                        doctorInvitation.getAssignedSubRole() != null
                                ? doctorInvitation.getAssignedSubRole().getName()
                                : null)
                .subRoleTag(
                        doctorInvitation.getAssignedSubRole() != null
                                ? doctorInvitation.getAssignedSubRole().getSubRoleTag()
                                : null)
                .build();
    }

    public static String fullName(String firstName, String lastName) {
        if (lastName != null) {
            return firstName != null ? firstName + " " + lastName : lastName;
        } else {
            return firstName != null ? firstName : "";
        }
    }

    public static DoctorInvitationDetails receivedInvitation(
            DoctorInvitation doctorInvitation, UserProfileSummary userProfile) {
        return DoctorInvitationDetails.builder()
                .firstName(userProfile.getFirstName())
                .lastName(userProfile.getLastName())
                .email(userProfile.getEmail())
                .countryCode(
                        doctorInvitation.getCountryCode() != null
                                ? doctorInvitation.getCountryCode().getCode()
                                : null)
                .mobileNo(userProfile.getMobileNo())
                .organizationId(userProfile.getOrganizationId())
                .invitationRole(doctorInvitation.getInvitationRole())
                .role(doctorInvitation.getInviterRole())
                .salutation(userProfile.getSalutation())
                .invitationCode(doctorInvitation.getDoctorInvitationCode().getCode())
                .invitedAt(doctorInvitation.getInvitedAt())
                .lastInvitationAt(doctorInvitation.getLastInvitationAt())
                .status(doctorInvitation.getStatus())
                .registrationType(doctorInvitation.getRegistrationType())
                .expiresAt(doctorInvitation.getExpiresAt())
                .acceptedAt(doctorInvitation.getAcceptedAt())
                .organizationName(doctorInvitation.getInviterUserProfile().getUserProfileOrgName())
                .organizationProfileUrl(Optional.ofNullable(doctorInvitation.getInviterUserProfile())
                        .map(UserProfile::getUser)
                        .map(User::displayPicture)
                        .orElse(null))
                .organizationProfileImageId(userProfile.getDisplayPictureId())
                .invitationId(doctorInvitation.getId())
                .doctorId(userProfile.getDoctorId())
                .profileId(userProfile.getProfileId())
                .profileUrl(userProfile.getProfilePicture())
                .profileImageId(userProfile.getProfilePictureId())
                .isAdmin(false)
                .displayName(userProfile.getDisplayName())
                .orgName(userProfile.getCompanyBrandName())
                //                .subRoleResponse(
                //                        doctorInvitation.getAssignedSubRole() != null
                //                                ? SubRoleResponse.from(doctorInvitation.getAssignedSubRole())
                //                                : null)
                .subRoleName(
                        doctorInvitation.getAssignedSubRole() != null
                                ? doctorInvitation.getAssignedSubRole().getName()
                                : null)
                .subRoleTag(
                        doctorInvitation.getAssignedSubRole() != null
                                ? doctorInvitation.getAssignedSubRole().getSubRoleTag()
                                : null)
                .build();
    }

    public static DoctorInvitationDetails from(
            UserProfile userProfile, DoctorInvitationActiveOrPendingRequest request) {
        return DoctorInvitationDetails.builder()
                .firstName(userProfile.getUser().getFirstName())
                .lastName(userProfile.getUser().getLastName())
                .email(userProfile.getUser().getEmail())
                .countryCode(
                        userProfile.getUser().getCountryCode() != null
                                ? userProfile.getUser().getCountryCode().getCode()
                                : userProfile.getDoctor().getCountryCode())
                .mobileNo(userProfile.getUser().getMobileNo())
                .organizationId(request.getOrganizationId())
                .salutation(userProfile.getUser().getSalutation())
                .organizationName(
                        userProfile.getDoctorBilling() != null
                                ? userProfile.getUserProfileOrgName()
                                : userProfile.getPracticeName())
                .organizationProfileUrl(
                        userProfile.getDoctorBilling() != null
                                ? userProfile.getDoctorBilling().getCompanyBrandProfilePicture()
                                : userProfile.getUser().displayPicture())
                .doctorId(userProfile.getDoctor().getId())
                .profileId(userProfile.getId())
                .profileUrl(userProfile.getUser().getProfileUrl())
                .isAdmin(true)
                .displayName((userProfile.getUser().getFirstName() != null
                                ? userProfile.getUser().getSalutation() + ". "
                                        + userProfile.getUser().getFirstName()
                                : "")
                        + (userProfile.getUser().getLastName() != null
                                ? " " + userProfile.getUser().getLastName()
                                : ""))
                .build();
    }
}
