package com.dentalstack.auth.dto.doctor;

import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import com.dentalstack.auth.enums.doctor.DoctorRole;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorPasswordSignUpRequest {
    @NotNull
    private String email;

    private String mobileNo;
    private Long organizationId;
    private String countryCode;
    private String firstName;
    private String lastName;
    private DeviceInfoDetails deviceInfoDetails;
    private String brand;
    private String salutation;
    private List<DoctorRole> roles;
    private List<DoctorRole> selectedRoles;
    private Boolean skipEmailOrMobileVerification = false;
}
