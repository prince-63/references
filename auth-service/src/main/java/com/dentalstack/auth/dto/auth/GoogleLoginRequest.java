package com.dentalstack.auth.dto.auth;

import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import com.dentalstack.auth.enums.patient.UserType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GoogleLoginRequest {
    private String email;
    private String token;
    private DeviceInfoDetails deviceInfoDetails;
    private UserType userType;
    private Long organizationId;
    private String orgName;
}
