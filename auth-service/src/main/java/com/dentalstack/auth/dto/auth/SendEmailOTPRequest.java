package com.dentalstack.auth.dto.auth;

import com.dentalstack.auth.enums.language.Language;
import com.dentalstack.auth.enums.patient.UserType;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SendEmailOTPRequest {
    @NotNull
    private String email;

    @NotNull
    private UserType userType;

    @Nullable
    private Language language;

    private Long organizationId;

    private String orgName;

    private String xOrgName;
}
