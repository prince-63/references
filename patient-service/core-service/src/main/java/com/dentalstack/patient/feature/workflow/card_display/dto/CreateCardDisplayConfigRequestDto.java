package com.dentalstack.patient.feature.workflow.card_display.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCardDisplayConfigRequestDto {
    @NotNull(message = "Profile ID is required")
    private Long profileId;

    private String invitationCode;
}
