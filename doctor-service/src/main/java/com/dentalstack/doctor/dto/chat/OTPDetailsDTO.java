package com.dentalstack.doctor.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OTPDetailsDTO {
    private String mobileNumber;
    private String emailId;
    private String otpNo;
    private String countryCode;

    public static OTPDetailsDTO from(String emailId, String otpNo) {
        return OTPDetailsDTO.builder()
                .mobileNumber(null)
                .emailId(emailId)
                .otpNo(otpNo)
                .build();
    }
}
