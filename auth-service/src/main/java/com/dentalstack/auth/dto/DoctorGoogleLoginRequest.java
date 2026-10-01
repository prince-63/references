package com.dentalstack.auth.dto;

import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorGoogleLoginRequest {
    private String email;
    private String token;
    private DeviceInfoDetails deviceInfoDetails;
}
