package com.dentalstack.auth.dto.token;

import com.dentalstack.auth.enums.patient.UserType;
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
