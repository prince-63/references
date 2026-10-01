package com.dentalstack.patient.feature.patient.entity;

import com.dentalstack.patient.feature.doctor.enums.InvitationStatus;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.UserType;
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

    // TODO this should be mapped with User table
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

    private Boolean isInvitationSent;

    @Nullable
    @OneToOne(mappedBy = "invitation", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private PatientInvitationDetails patientInvitation;
}
