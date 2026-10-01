package com.dentalstack.patient.feature.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InvitationRequest {

    private String doctorName;
    private String patientName;
    private String patientEmail;
    private String inviteCode;
    private String patientMobile;
    private String countryCode;
    private Long doctorId;
    private String orgName;

    public static InvitationRequest forEmail(
            String doctorName,
            String patientName,
            String inviteCode,
            String patientEmail,
            long doctorId,
            String orgName) {
        return InvitationRequest.builder()
                .doctorName(doctorName)
                .patientEmail(patientEmail)
                .inviteCode(inviteCode)
                .patientName(patientName)
                .doctorId(doctorId)
                .orgName(orgName)
                .build();
    }

    public static InvitationRequest forSMS(
            String doctorName, String inviteCode, String patientMobile, String countryCode, long doctorId) {
        return InvitationRequest.builder()
                .doctorName(doctorName)
                .patientMobile(patientMobile)
                .inviteCode(inviteCode)
                .countryCode(countryCode)
                .doctorId(doctorId)
                .build();
    }
}
