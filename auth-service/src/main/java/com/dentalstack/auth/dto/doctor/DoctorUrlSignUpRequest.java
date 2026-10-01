package com.dentalstack.auth.dto.doctor;

import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import com.dentalstack.auth.enums.auth.credentials.CredentialType;
import com.dentalstack.auth.enums.doctor.DoctorRole;
import com.dentalstack.auth.enums.doctor.UserRegistrationType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorUrlSignUpRequest {

    @NotNull
    private String email;

    private String mobileNo;

    private String countryCode;

    @NotNull
    private String firstName;

    private String lastName;

    private DeviceInfoDetails deviceInfoDetails;
    private String salutation;
    private UserRegistrationType registrationType;
    private String invitationCode;
    private long organizationId;
    private long doctorId;

    private int otp;

    private String brand;
    private CredentialType credentialType;
    private DoctorRole doctorRole;
    private Boolean skip;
}
