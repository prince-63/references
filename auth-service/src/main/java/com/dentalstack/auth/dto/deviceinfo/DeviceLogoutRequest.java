package com.dentalstack.auth.dto.deviceinfo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeviceLogoutRequest {

    private DeviceInfoDetails deviceInfoDetails;

    private Long organizationId;

    private String email;
}
