package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.patient.enums.PatientType;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.language.Language;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterPatientRequest {
    private String firstName;
    private String lastName;

    private AddressDetails address;

    @NotNull
    private Integer age;

    private String email;
    private String mobile;
    private String customerMappedId;
    private CountryCode countryCode;
    private String referralCode;
    private String gender;
    private Language language;
    private Boolean isWhitelabel;
    private String orgName;
    private String country;
    private String city;
    private String state;

    @Nullable
    private PatientType patientType;
}
