package com.dentalstack.chat.dto.chat;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AddChatRequest {
    private String message;

    @NotNull(message = "patientId is required")
    private Long patientId;

    @NotNull(message = "doctorId is required")
    private Long doctorId;

    private String imageName;

    @NotBlank(message = "roleName is required")
    private String roleName;

    private String createdBy;
    private String doctorName;
    private String patientName;
    private JsonNode additionalData;
}
