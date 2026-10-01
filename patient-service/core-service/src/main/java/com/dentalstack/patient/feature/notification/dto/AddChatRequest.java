package com.dentalstack.patient.feature.notification.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class AddChatRequest {
    private String message;
    private Long patientId;
    private Long doctorId;
    private String imageName;
    private String roleName;
    private String createdBy;
    private String doctorName;
    private String patientName;
    private JsonNode additionalData;
}
