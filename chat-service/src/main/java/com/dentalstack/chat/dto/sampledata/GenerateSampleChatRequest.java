package com.dentalstack.chat.dto.sampledata;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GenerateSampleChatRequest {
    private Long patientId;
    private String patientName;

    private Long doctorId;
    private String doctorName;
}
