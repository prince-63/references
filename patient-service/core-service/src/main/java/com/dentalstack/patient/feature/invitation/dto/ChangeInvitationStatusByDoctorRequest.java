package com.dentalstack.patient.feature.invitation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangeInvitationStatusByDoctorRequest {
    private Long doctorId;
    private Long invitationId;
    private Status status;
    private String doctorName;

    public enum Status {
        CANCELLED,
        RESENT;

        public com.dentalstack.patient.feature.invitation.enums.Status toInvitationStatus() {
            return switch (this) {
                case CANCELLED -> com.dentalstack.patient.feature.invitation.enums.Status.CANCELLED;
                case RESENT -> com.dentalstack.patient.feature.invitation.enums.Status.PENDING;
            };
        }
    }
}
