package com.dentalstack.patient.feature.doctorinvitation.entity;

import com.dentalstack.patient.feature.doctor.entity.Doctor;
import com.dentalstack.patient.feature.doctor.entity.Organization;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationRequest;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationRole;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.doctorinvitation.enums.UserRegistrationType;
import com.dentalstack.patient.feature.rbac.entity.SubRole;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Supplier;
import lombok.*;

@Entity
@Table(name = "doctor_invitation")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorInvitation extends BaseEntity {
    @NotNull
    private String UUID;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "inviter_user_profile_id")
    private UserProfile inviterUserProfile;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inviter_id")
    private Doctor inviter;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_doctor_id")
    private Doctor invitedDoctor;

    @NotNull
    private String email;

    @NotNull
    private String firstName;

    private String lastName;

    private String mobileNo;

    private String salutation;

    @NotNull
    @Enumerated(EnumType.STRING)
    private InvitationStatus status;

    @NotNull
    @Enumerated(EnumType.STRING)
    private List<InvitationRole> invitationRole;

    @Enumerated(EnumType.STRING)
    private InvitationRole roles;

    @Nullable
    @Enumerated(EnumType.STRING)
    private CountryCode countryCode;

    @NotNull
    @Enumerated(EnumType.STRING)
    private UserRegistrationType registrationType;

    private ZonedDateTime invitedAt;
    private ZonedDateTime expiresAt;

    @Nullable
    private ZonedDateTime acceptedAt;

    private ZonedDateTime lastInvitationAt;

    @NotNull
    @OneToOne(mappedBy = "doctorInvitation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private DoctorInvitationCode doctorInvitationCode;

    @Enumerated(EnumType.STRING)
    private InvitationRole inviterRole;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_sub_role_id")
    private SubRole assignedSubRole;

    private Boolean isTrackingEnabled;

    private Boolean isStlFileViewEnabled;

    private Boolean isScanFileViewEnabled;

    private Boolean isPrintFileViewEnabled;

    private String xOrganizationName;

    public String getFullName() {
        return salutation + " " + firstName + " " + lastName;
    }

    public void validateInvitationForResent() {
        if (status == InvitationStatus.EXPIRED) {
            String newCode = generateNewInvitationCode();
            this.doctorInvitationCode.setCode(newCode);

            this.status = InvitationStatus.PENDING;
            this.expiresAt = ZonedDateTime.now().plusDays(1000);
        }
    }

    private String generateNewInvitationCode() {
        return java.util.UUID.randomUUID().toString();
    }

    public static void updateDetails(
            DoctorInvitation doctorInvitation, DoctorInvitationRequest request, SubRole subRole) {
        updateIfPresent(request::getEmail, doctorInvitation::setEmail);
        updateIfPresent(request::getFirstName, doctorInvitation::setFirstName);
        updateIfPresent(request::getLastName, doctorInvitation::setLastName);
        updateIfPresent(request::getMobileNo, doctorInvitation::setMobileNo);
        updateIfPresent(request::getCountryCode, doctorInvitation::setCountryCode);
        updateIfPresent(request::getSalutation, doctorInvitation::setSalutation);
        updateIfPresent(() -> subRole, doctorInvitation::setAssignedSubRole);
    }

    private static <T> void updateIfPresent(Supplier<T> getter, Consumer<T> setter) {
        Optional.ofNullable(getter.get()).ifPresent(setter);
    }

    public static DoctorInvitation createDoctorInvitation(
            DoctorInvitationRequest request,
            UserProfile userProfile,
            @Nullable Doctor existingDoctor,
            SubRole subRole,
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
                .roles(InvitationRole.INTERNAL_USER)
                .invitationRole(List.of(InvitationRole.INTERNAL_USER))
                .registrationType(
                        existingDoctor != null
                                ? UserRegistrationType.EXISTING_USER
                                : UserRegistrationType.NEW_USER_INVITED)
                .countryCode(request.getCountryCode() != null ? request.getCountryCode() : null)
                .invitedAt(ZonedDateTime.now())
                .expiresAt(ZonedDateTime.now().plusDays(1000))
                .invitedDoctor(existingDoctor)
                .assignedSubRole(subRole)
                .isTrackingEnabled(request.getIsTrackingEnabled())
                .isStlFileViewEnabled(request.getIsStlFileViewEnabled())
                .isScanFileViewEnabled(request.getIsScanFileViewEnabled())
                .isPrintFileViewEnabled(request.getIsPrintFileViewEnabled())
                .xOrganizationName(xOrgName)
                .build();
    }
}
