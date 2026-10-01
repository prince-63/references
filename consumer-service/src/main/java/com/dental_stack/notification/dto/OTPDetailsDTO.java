package com.dental_stack.notification.dto;

import lombok.Data;

@Data
public class OTPDetailsDTO {
    private String emailId;
    private String mobileNumber;
    private String otpNo;
    private String countryCode;
}
