package com.dentalstack.auth.dto.email;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OtpEmailSend {

    private String lastName;

    private String firstName;

    private String email;

    private String otpNo;

    public static OtpEmailSend from(String doctorEmail, String otpNo) {
        return OtpEmailSend.builder().email(doctorEmail).otpNo(otpNo).build();
    }
}
