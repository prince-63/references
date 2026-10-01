package com.dentalstack.doctor.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCardDisplayConfigRequestDto {
    @NotNull(message = "Profile ID is required")
    private Long profileId;

    private String invitationCode;

    public CreateCardDisplayConfigRequestDto(Long profileId) {
        this.profileId = profileId;
    }

    public CreateCardDisplayConfigRequestDto(Long profileId, String invitationCode) {
        this.profileId = profileId;
        this.invitationCode = invitationCode;
    }
}
