package com.dentalstack.auth.dto.doctor;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SendResetPasswordOTPRequest {
    private String mobileNo;
    private String countryCode;
}
