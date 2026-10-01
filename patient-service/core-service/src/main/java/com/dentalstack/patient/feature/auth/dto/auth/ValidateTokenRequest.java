package com.dentalstack.patient.feature.auth.dto.auth;

import com.dentalstack.patient.feature.user.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ValidateTokenRequest {
    private String token;
    private Long userId;
    private UserType userType;
}
