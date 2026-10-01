package com.dentalstack.patient.feature.doctorinvitation.dto;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctorinvitation.enums.UserRegistrationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorInvitationEmailRequest {

    private String senderCompanyName;
    private String receiverUserName;
    private String email;
    private String inviteCode;
    private DoctorRole doctorRole;
    private UserRegistrationType registrationType;
    private String senderEmail;
    private String orgName;
}
