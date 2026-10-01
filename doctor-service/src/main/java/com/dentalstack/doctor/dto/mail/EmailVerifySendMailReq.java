package com.dentalstack.doctor.dto.mail;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmailVerifySendMailReq {

    private Long doctorId;

    private String doctorFirstName;

    private String doctorLastName;

    private String doctorEmail;

    public static EmailVerifySendMailReq from(
            Long doctorId, String doctorFirstName, String doctorLastName, String doctorEmail) {
        return EmailVerifySendMailReq.builder()
                .doctorId(doctorId)
                .doctorFirstName(doctorFirstName)
                .doctorLastName(doctorLastName)
                .doctorEmail(doctorEmail)
                .build();
    }
}
