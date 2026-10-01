package com.dentalstack.auth.dto.auth;

import com.dentalstack.auth.enums.patient.UserType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class StartPasswordSignUpRequest {

    @NotNull
    private String email;

    @NotNull
    private String password;

    private Long organizationId;

    @NotNull
    private UserType userType;

    private boolean userConsent;
}
