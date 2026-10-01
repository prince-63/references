package com.dentalstack.patient.feature.invitation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangeNewInvitationStatusByDoctorRequest {
    private Long doctorId;
    private Long invitationId;
    private String doctorName;

    private InvitationStatus invitationStatus;

    public enum InvitationStatus {
        CANCELLED,
        RESENT;

        public com.dentalstack.patient.feature.invitation.enums.InvitationStatus toInvitationStatus() {
            return switch (this) {
                case CANCELLED -> com.dentalstack.patient.feature.invitation.enums.InvitationStatus.CANCELLED;
                case RESENT -> com.dentalstack.patient.feature.invitation.enums.InvitationStatus.SENT;
            };
        }
    }

    public com.dentalstack.patient.feature.invitation.enums.InvitationStatus toInvitationStatus() {
        return invitationStatus.toInvitationStatus();
    }
}
