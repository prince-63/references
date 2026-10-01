package com.dentalstack.doctor.entity.invitation;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.organization.Organization;
import com.dentalstack.doctor.entity.rbac.SubRole;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.invitation.InvitationRole;
import com.dentalstack.doctor.enums.invitation.InvitationStatus;
import com.dentalstack.doctor.enums.invitation.UserRegistrationType;
import com.dentalstack.doctor.enums.user.CountryCode;
import com.dentalstack.doctor.exception.invitation.InvitationExpiredException;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.List;
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
    private InvitationRole roles; // to which role doctor has invited the user // role of the invited user

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
    @OneToOne(mappedBy = "doctorInvitation", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private DoctorInvitationCode doctorInvitationCode;

    @Enumerated(EnumType.STRING)
    private InvitationRole inviterRole; // the role of the inviter

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_sub_role_id")
    private SubRole assignedSubRole;

    private Boolean isTrackingEnabled;

    private Boolean isStlFileViewEnabled;

    private Boolean isScanFileViewEnabled;

    private Boolean isPrintFileViewEnabled;

    private String xOrganizationName;

    /**
     * @deprecated Use {@link com.dentalstack.doctor.service.invitation.InvitationValidator#validateNotExpired(DoctorInvitation)} instead.
     */
    @Deprecated(forRemoval = true)
    public void validateInvitation() {
        if (status == InvitationStatus.EXPIRED) {
            throw new InvitationExpiredException();
        }
    }

    /**
     * @deprecated Use {@link com.dentalstack.doctor.service.invitation.InvitationValidator#refreshIfExpired(DoctorInvitation)} instead.
     */
    @Deprecated(forRemoval = true)
    public void validateInvitationForResent() {
        if (status == InvitationStatus.EXPIRED) {
            String newCode = generateNewInvitationCode();
            this.doctorInvitationCode.setCode(newCode);

            // Update the status and expiration date
            this.status = InvitationStatus.PENDING;
            this.expiresAt = ZonedDateTime.now().plusDays(1000);
        }
    }

    private String generateNewInvitationCode() {
        // Logic to generate a new unique invitation code
        return java.util.UUID.randomUUID().toString();
    }
}
