package com.dentalstack.auth.dto.doctor;

import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import com.dentalstack.auth.enums.patient.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorPasswordLoginRequest {
    @NotNull
    private String email;

    @NotNull
    private String password;

    private Long organizationId;

    private DeviceInfoDetails deviceInfoDetails;

    private UserType userType;
    private String orgName;
}
