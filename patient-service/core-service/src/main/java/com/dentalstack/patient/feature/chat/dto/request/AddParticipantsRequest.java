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
public class AddParticipantsRequest {

    @NotNull(message = "Chat ID is required")
    private Long chatId;

    private List<Long> userProfileIds;

    private List<Long> caseTeamIds;
    private Long profileId;
}
