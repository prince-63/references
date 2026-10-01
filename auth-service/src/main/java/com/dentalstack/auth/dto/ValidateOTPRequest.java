package com.dentalstack.auth.dto;

import com.dentalstack.auth.enums.patient.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ValidateOTPRequest {
    @NotNull
    private String mobileNo;

    @NotNull
    private String countryCode;

    private int otp;

    private Long organizationId;

    private UserType userType;
}
