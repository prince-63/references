package com.dentalstack.auth.dto.patient;

import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientPasswordLoginRequest {

    @NotNull
    private String email;

    @NotNull
    private String password;

    private DeviceInfoDetails deviceInfoDetails;
}
