package com.dentalstack.patient.feature.invitation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangeInvitationStatusByPatient {
    private Long patientId;
    private Long invitationId;
    private String doctorName;
    private String inviteCode;
    private InvitationStatus invitationStatus;

    public enum InvitationStatus {
        ACCEPTED,
        DECLINED;

        public com.dentalstack.patient.feature.invitation.enums.InvitationStatus toInvitationStatus() {
            return switch (this) {
                case ACCEPTED -> com.dentalstack.patient.feature.invitation.enums.InvitationStatus.ACCEPTED;
                case DECLINED -> com.dentalstack.patient.feature.invitation.enums.InvitationStatus.DECLINED;
            };
        }
    }

    public com.dentalstack.patient.feature.invitation.enums.InvitationStatus toInvitationStatus() {
        return invitationStatus.toInvitationStatus();
    }
}
