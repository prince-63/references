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
public class DoctorGoogleSignupRequest {
    @NotNull
    private String email;

    private String mobileNo;

    private String token;

    private String countryCode;
    private String firstName;
    private String lastName;

    private DeviceInfoDetails deviceInfoDetails;
    private String salutation;
    private List<DoctorRole> roles;
    private String brand;
    private List<DoctorRole> selectedRoles;
    private Long organizationId;
}
