package com.dentalstack.auth.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountPasswordValidateRequest {
    private String password;
    private String email;
    private String xOrgName;
}
