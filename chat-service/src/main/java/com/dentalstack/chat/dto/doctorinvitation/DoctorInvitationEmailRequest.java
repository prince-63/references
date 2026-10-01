package com.dentalstack.chat.dto.doctorinvitation;

import com.dentalstack.chat.enums.invitation.DoctorRole;
import com.dentalstack.chat.enums.invitation.UserRegistrationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
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
