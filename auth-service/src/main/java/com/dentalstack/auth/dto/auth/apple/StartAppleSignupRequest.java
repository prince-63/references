package com.dentalstack.auth.dto.auth.apple;

import com.dentalstack.auth.enums.patient.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StartAppleSignupRequest {
    private String email;

    @NotNull
    private UserType userType;

    private Long organizationId;
    private String idToken;
}
