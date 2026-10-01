package com.dentalstack.chat.dto.otp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateMobileNumberRequest {

    private String mobileNumber;
    private String otp;
    private Long patientId;
    private String countryCode;
}
