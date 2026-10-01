package com.dentalstack.auth.dto.auth;

import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import com.dentalstack.auth.enums.patient.UserType;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PasswordSignUpRequest {
    @NotNull
    private String email;

    @NotNull
    private String mobileNo;

    private String countryCode;
    private String firstName;
    private String lastName;

    private DeviceInfoDetails deviceInfoDetails;

    private List<String> roles;
    private UserType userType;
    private String brand;
}
