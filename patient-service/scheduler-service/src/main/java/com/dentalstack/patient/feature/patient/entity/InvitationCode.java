package com.dentalstack.patient.feature.patient.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(
        name = "invitation_code",
        indexes = {@Index(name = "IX_invitation_code", columnList = "code")})
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvitationCode extends BaseEntity {

    @NotNull
    private String code;

    @Nullable
    @OneToOne
    @JoinColumn(name = "invitation_id")
    private Invitation invitation;

    public static InvitationCode newInvite(String code, Invitation invitation) {
        return new InvitationCode(code, invitation);
    }
}
