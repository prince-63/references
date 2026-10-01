package com.dentalstack.auth.dto;

import com.dentalstack.auth.enums.patient.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SendOTPRequest {
    @NotNull
    private String email;

    @NotNull
    private String mobileNo;

    @NotNull
    private String countryCode;

    private Long organizationId;

    @NotNull
    private UserType userType;
}
