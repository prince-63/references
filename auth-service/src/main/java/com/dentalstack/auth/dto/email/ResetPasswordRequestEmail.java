package com.dentalstack.auth.dto.email;

import com.dentalstack.auth.enums.patient.UserType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordRequestEmail {
    private String email;
    private String newPassword;
    private Long organizationId;
    private UserType userType;
}
