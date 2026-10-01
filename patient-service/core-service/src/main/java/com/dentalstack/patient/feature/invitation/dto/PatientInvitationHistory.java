package com.dentalstack.patient.feature.invitation.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PatientInvitationHistory {

    private List<PatientInvitationDetails> patientInvitation;

    private Long doctorId;

    private Integer resendCount;

    private boolean isNewPatient;

    public static PatientInvitationHistory from(
            List<PatientInvitationDetails> patientInvitationDetails,
            Long doctorId,
            Integer resendCount,
            boolean newPatient) {
        return PatientInvitationHistory.builder()
                .patientInvitation(patientInvitationDetails)
                .doctorId(doctorId)
                .resendCount(resendCount)
                .isNewPatient(newPatient)
                .build();
    }
}
