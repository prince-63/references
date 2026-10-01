package com.dentalstack.auth.dto.auth;

import com.dentalstack.auth.enums.patient.UserType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RefreshTokenRequest {
    private String email;
    private Long organizationId;
    private UserType userType;
}
