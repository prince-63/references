package com.dental_stack.notification.dto;

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
}
