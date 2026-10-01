package com.dentalstack.patient.feature.chat.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateChatRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String chatName;

    private String description;

    private List<Long> participantUserProfileIds;

    private List<Long> caseTeamIds;
    private Long profileId;
}
