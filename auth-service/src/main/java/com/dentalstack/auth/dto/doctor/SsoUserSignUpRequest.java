package com.dentalstack.auth.dto.doctor;

import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import com.dentalstack.auth.enums.doctor.DoctorRole;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SsoUserSignUpRequest {
    @NotNull
    private String email;

    private String mobileNo;

    private String countryCode;
    private String firstName;
    private String lastName;
    private DeviceInfoDetails deviceInfoDetails;
    private String brand;
    private String salutation;
    private List<DoctorRole> roles;
    private String organizationId;
}
