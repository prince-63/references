package com.dentalstack.patient.feature.invitation.entity;

import com.dentalstack.patient.feature.invitation.dto.InvitePatientRequest;
import com.dentalstack.patient.feature.invitation.dto.v2.InvitePatientRequestV2;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import lombok.*;

@Entity
@Table(
        name = "invitation",
        indexes = {@Index(name = "IX_invitation_inviter_id", columnList = "inviterId")})
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invitation extends BaseEntity {

    private long inviterId;

    @NotNull
    private UserType inviterUserType;

    @NotNull
    @OneToOne(mappedBy = "invitation", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private InvitationCode invitationCode;

    @NotNull
    private UserType invitedUserType;

    @NotNull
    private InvitationStatus status;

    @Builder.Default
    private int sentCount = 0;

    private ZonedDateTime resentInviteAt;
    private ZonedDateTime invitationSentAt;

    private Boolean isInvitationSent;

    @Nullable
    @OneToOne(mappedBy = "invitation", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private PatientInvitationDetails patientInvitation;

    public static Invitation from(InvitePatientRequest request, Patient patient) {
        var invite = Invitation.builder()
                .inviterId(request.getInviterId())
                .inviterUserType(request.getInviterUserType())
                .invitedUserType(UserType.PATIENT)
                .status(InvitationStatus.SENT)
                .sentCount(1)
                .isInvitationSent(false)
                .build();
        var patientInvite = PatientInvitationDetails.from(request, invite, patient);
        invite.setPatientInvitation(patientInvite);
        return invite;
    }

    public static Invitation from(InvitePatientRequestV2 request, Patient patient) {
        var invite = Invitation.builder()
                .inviterId(request.getInviterId())
                .inviterUserType(request.getInviterUserType())
                .invitedUserType(UserType.PATIENT)
                .status(InvitationStatus.SENT)
                .sentCount(1)
                .isInvitationSent(false)
                .build();
        var patientInvite = PatientInvitationDetails.from(request, invite, patient);
        invite.setPatientInvitation(patientInvite);
        return invite;
    }

    public static AppInviteStatus convertInvitationStatus(InvitationStatus status, Boolean isInvitationSent) {
        if (status == null || isInvitationSent == null) {
            return AppInviteStatus.NOT_CONNECTED;
        } else if (status.equals(InvitationStatus.ACCEPTED)) {
            return AppInviteStatus.CONNECTED;
        } else if (status.equals(InvitationStatus.SENT) && isInvitationSent) {
            return AppInviteStatus.PENDING;
        } else {
            return AppInviteStatus.NOT_CONNECTED;
        }
    }
}
