package com.dentalstack.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountPasswordValidateRequest {
    private String password;
    private String email;
    private String xOrgName;
}
