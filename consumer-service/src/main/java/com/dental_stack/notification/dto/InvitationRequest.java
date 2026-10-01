package com.dental_stack.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvitationRequest {
    private String doctorName;
    private String patientName;
    private String patientEmail;
    private String inviteCode;
    private String patientMobile;
    private String countryCode;
    private Long doctorId;
    private String orgName;
}
