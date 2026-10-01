package com.dentalstack.doctor.dto.mail;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmailSendReq {

    private String doctorFirstName;

    private String doctorLastName;

    private String doctorEmail;
    private String practiceAdminName;
    private String inviteCode;
    private String orgName;
    private String name;
    private String orgEmail;

    public static EmailSendReq from(String doctorFirstName, String doctorLastName, String doctorEmail) {
        return EmailSendReq.builder()
                .doctorFirstName(doctorFirstName)
                .doctorLastName(doctorLastName)
                .doctorEmail(doctorEmail)
                .build();
    }
}
