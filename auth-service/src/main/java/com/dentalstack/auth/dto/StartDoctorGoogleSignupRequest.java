package com.dentalstack.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StartDoctorGoogleSignupRequest {
    private String email;
    private String token;
}
