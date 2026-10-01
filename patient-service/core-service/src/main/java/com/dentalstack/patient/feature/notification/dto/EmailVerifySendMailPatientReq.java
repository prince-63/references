package com.dentalstack.patient.feature.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmailVerifySendMailPatientReq {

    private String patientName;
    private Long patientId;
    private String email;
    private String mailVerifyLink;

    public static EmailVerifySendMailPatientReq from(
            String email, Long patientId, String patientName, String mailVerifyLink) {
        return EmailVerifySendMailPatientReq.builder()
                .patientName(patientName)
                .patientId(patientId)
                .email(email)
                .mailVerifyLink(mailVerifyLink)
                .build();
    }
}
