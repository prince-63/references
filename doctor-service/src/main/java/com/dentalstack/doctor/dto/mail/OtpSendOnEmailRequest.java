package com.dentalstack.doctor.dto.mail;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OtpSendOnEmailRequest {

    private String doctorFirstName;

    private String doctorLastName;

    private String doctorEmail;

    private String otpNo;

    private String otpFor;

    public static OtpSendOnEmailRequest from(OtpSendOnEmailRequest otpSendOnEmailRequest) {
        return OtpSendOnEmailRequest.builder()
                .doctorEmail(otpSendOnEmailRequest.getDoctorEmail())
                .doctorFirstName(otpSendOnEmailRequest.getDoctorFirstName())
                .doctorLastName(otpSendOnEmailRequest.doctorLastName)
                .build();
    }
}
