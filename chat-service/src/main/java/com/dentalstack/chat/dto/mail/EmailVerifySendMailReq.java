package com.dentalstack.chat.dto.mail;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailVerifySendMailReq {

    private Long doctorId;

    private String doctorFirstName;

    private String doctorLastName;

    private String doctorEmail;
}
