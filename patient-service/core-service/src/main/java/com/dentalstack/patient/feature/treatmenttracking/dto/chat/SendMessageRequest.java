package com.dentalstack.patient.feature.treatmenttracking.dto.chat;

import java.util.List;
import lombok.Data;

@Data
public class SendMessageRequest {
    private Long patientId;
    private String message;
    private List<Long> attachmentFileIds;
}
