package com.dentalstack.auth.dto;

import com.dentalstack.auth.enums.patient.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ValidateEmailOTPRequest {

    @NotNull
    private String email;

    private int otp;

    private Long organizationId;

    private UserType userType;
}
