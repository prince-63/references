package com.dentalstack.doctor.mapper;

import com.dentalstack.doctor.dto.invitation.DoctorInvitationRequest;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.invitation.DoctorInvitation;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.invitation.InvitationRole;
import com.dentalstack.doctor.enums.invitation.InvitationStatus;
import com.dentalstack.doctor.enums.invitation.UserRegistrationType;
import jakarta.annotation.Nullable;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Supplier;

/**
 * Mapper class responsible for creating and updating {@link DoctorInvitation} entities
 * from various DTOs.
 */
public final class DoctorInvitationMapper {

    private DoctorInvitationMapper() {
        // Utility class — no instantiation
    }

    public static DoctorInvitation fromRequest(
            DoctorInvitationRequest request,
            UserProfile userProfile,
            @Nullable Doctor existingDoctor,
            List<InvitationRole> invitationRoles,
            InvitationRole inviterRole,
            String xOrgName) {

        return DoctorInvitation.builder()
                .UUID(java.util.UUID.randomUUID().toString())
                .organization(userProfile.getOrganization())
                .inviter(userProfile.getDoctor())
                .inviterUserProfile(userProfile)
                .inviterRole(inviterRole)
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .mobileNo(request.getMobileNo())
                .salutation(request.getSalutation())
                .status(InvitationStatus.PENDING)
                .roles(invitationRoles.get(0))
                .invitationRole(invitationRoles)
                .registrationType(
                        existingDoctor != null
                                ? UserRegistrationType.EXISTING_USER
                                : UserRegistrationType.NEW_USER_INVITED)
                .countryCode(request.getCountryCode() != null ? request.getCountryCode() : null)
                .invitedAt(ZonedDateTime.now())
                .expiresAt(ZonedDateTime.now().plusDays(1000))
                .invitedDoctor(existingDoctor)
                .isTrackingEnabled(request.getIsTrackingEnabled())
                .isStlFileViewEnabled(request.getIsStlFileViewEnabled())
                .isScanFileViewEnabled(request.getIsScanFileViewEnabled())
                .isPrintFileViewEnabled(request.getIsPrintFileViewEnabled())
                .xOrganizationName(xOrgName)
                .build();
    }

    public static void updateFromRequest(
            DoctorInvitation doctorInvitation, DoctorInvitationRequest request, List<InvitationRole> invitationRoles) {
        updateIfPresent(request::getEmail, doctorInvitation::setEmail);
        updateIfPresent(request::getFirstName, doctorInvitation::setFirstName);
        updateIfPresent(request::getLastName, doctorInvitation::setLastName);
        updateIfPresent(request::getMobileNo, doctorInvitation::setMobileNo);
        updateIfPresent(request::getCountryCode, doctorInvitation::setCountryCode);
        updateIfPresent(request::getSalutation, doctorInvitation::setSalutation);
        if (invitationRoles != null) {
            doctorInvitation.setRoles(invitationRoles.get(0));
            doctorInvitation.setInvitationRole(invitationRoles);
        }
    }

    private static <T> void updateIfPresent(Supplier<T> getter, Consumer<T> setter) {
        Optional.ofNullable(getter.get()).ifPresent(setter);
    }
}
