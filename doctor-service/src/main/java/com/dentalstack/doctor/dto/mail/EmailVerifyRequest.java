package com.dentalstack.doctor.dto.mail;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailVerifyRequest {
    private String email;
    private Long doctorId;
    private String doctorName;
    private String otpNo;
}
