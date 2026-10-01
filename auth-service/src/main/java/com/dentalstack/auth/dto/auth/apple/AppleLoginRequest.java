package com.dentalstack.auth.dto.auth.apple;

import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import com.dentalstack.auth.enums.patient.UserType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppleLoginRequest {
    private String email;
    private String idToken;
    private DeviceInfoDetails deviceInfoDetails;
    private UserType userType;
    private String orgName;
    private Long organizationId;
}
