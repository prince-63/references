package com.dentalstack.auth.dto.patient;

import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import com.dentalstack.auth.enums.language.Language;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientPasswordSignUpRequest {
    @NotNull
    private String email;

    private String mobile;

    private Integer age;

    private String countryCode;

    private String firstName;

    private String lastName;

    private AddressDetails addressDetails;

    private DeviceInfoDetails deviceInfoDetails;

    private String gender;
    private Language language;
    private Boolean isWhitelabel;
    private String orgName;
}
