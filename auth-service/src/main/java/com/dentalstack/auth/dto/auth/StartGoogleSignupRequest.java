package com.dentalstack.auth.dto.auth;

import com.dentalstack.auth.enums.patient.UserType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StartGoogleSignupRequest {
    private String email;
    private String token;
    private Long organizationId;
    private UserType userType;
}
