package com.dentalstack.chat.dto.sms;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class SmsToDoctor {

    private String mobile;

    private String doctorName;

    private String patientName;

    private String countryCode;

    public static SmsToDoctor from(String mobile, String doctorName, String patientName) {

        return SmsToDoctor.builder()
                .mobile(mobile)
                .doctorName(doctorName)
                .patientName(patientName)
                .build();
    }
}
