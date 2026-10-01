package com.dentalstack.auth.dto.email;

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
    private String doctorEmail;
    private String orgName;
    private String xOrgName;
    private Long organizationId;

    public static EmailSendReq from(String email, String name, String orgName) {
        return EmailSendReq.builder()
                .doctorFirstName(name)
                .doctorEmail(email)
                .orgName(orgName)
                .build();
    }

    public static EmailSendReq from(String email, String name, String orgName, Long organizationId, String xOrgName) {
        return EmailSendReq.builder()
                .doctorFirstName(name)
                .doctorEmail(email)
                .orgName(orgName)
                .xOrgName(xOrgName)
                .organizationId(organizationId)
                .build();
    }
}
