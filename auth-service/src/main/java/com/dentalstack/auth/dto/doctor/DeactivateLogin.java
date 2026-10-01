package com.dentalstack.auth.dto.doctor;

import com.dentalstack.auth.enums.patient.UserType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeactivateLogin {
    private String email;
    private Long organizationId;
    private UserType userType;
}
