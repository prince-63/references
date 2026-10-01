package com.dentalstack.patient.feature.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GenerateSampleChatRequest {
    private Long patientId;
    private String patientName;

    private Long doctorId;
    private String doctorName;
}
