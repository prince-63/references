package com.dentalstack.patient.feature.doctorinvitation.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "doctor_invitation_code")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorInvitationCode extends BaseEntity {

    @NotNull
    private String code;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_invitation_id")
    @ToString.Exclude
    private DoctorInvitation doctorInvitation;

    public static DoctorInvitationCode newInvite(String code, DoctorInvitation invitation) {
        return new DoctorInvitationCode(code, invitation);
    }
}
