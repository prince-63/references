package com.dentalstack.auth.dto.auth;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthDetailsUpdateRequest {
    @NotNull
    private String email;

    private String mobileNo;
    private String countryCode;
    private String firstName;
    private String lastName;
    private String salutation;
    private Long organizationId;
}
