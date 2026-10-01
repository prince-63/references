package com.dentalstack.auth.dto.otp;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OTPDetailsDTO {
    private String emailId;
    private String mobileNumber;
    private String otpNo;
    private String countryCode;

    public OTPDetailsDTO(String mobileNumber, int otp, String countryCode) {
        this.otpNo = String.valueOf(otp);
        this.mobileNumber = mobileNumber;
        this.countryCode = countryCode;
    }
}
