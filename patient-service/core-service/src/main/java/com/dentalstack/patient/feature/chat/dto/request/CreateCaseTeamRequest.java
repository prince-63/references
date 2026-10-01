package com.dentalstack.patient.feature.chat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateCaseTeamRequest {

    @NotBlank(message = "Team name is required")
    @Size(min = 3, max = 100, message = "Team name must be between 3 and 100 characters")
    private String teamName;

    private String description;

    @NotNull(message = "At least one member is required")
    @Size(min = 1, message = "At least one member is required")
    private List<Long> memberUserProfileIds;

    private Long profileId;
}
