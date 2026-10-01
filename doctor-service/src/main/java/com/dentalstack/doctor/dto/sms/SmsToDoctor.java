package com.dentalstack.doctor.dto.sms;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class SmsToDoctor {

    private String mobile;

    private String doctorName;

    private String patientName;

    private String countryCode;

    public static SmsToDoctor from(String mobile, String doctorName, String patientName, String countryCode) {
        return SmsToDoctor.builder()
                .mobile(mobile)
                .doctorName(doctorName)
                .patientName(patientName)
                .countryCode(countryCode)
                .build();
    }
}
