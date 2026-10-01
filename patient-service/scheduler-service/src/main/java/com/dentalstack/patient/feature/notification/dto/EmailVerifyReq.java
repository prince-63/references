package com.dentalstack.patient.feature.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailVerifyReq {
    private String email;
    private Long patientId;
    private String patientName;
}
