package com.dentalstack.auth.dto.patient;

import com.dentalstack.auth.enums.language.Language;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegisterPatientRequest {
    private String firstName;
    private String lastName;

    private AddressDetails address;

    private Integer age;

    private String email;
    private String mobile;
    private String countryCode;
    private String gender;
    private Language language;
    private Boolean isWhitelabel;
    private String orgName;

    public static RegisterPatientRequest from(PatientPasswordSignUpRequest request) {
        return RegisterPatientRequest.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .age(request.getAge())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .address(request.getAddressDetails())
                .countryCode(request.getCountryCode())
                .gender(request.getGender())
                .language(request.getLanguage())
                .isWhitelabel(request.getIsWhitelabel())
                .orgName(request.getOrgName())
                .build();
    }

    public static RegisterPatientRequest from(Patient3rdPartySignUpRequest request) {
        return RegisterPatientRequest.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .age(request.getAge())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .address(request.getAddressDetails())
                .countryCode(request.getCountryCode())
                .gender(request.getGender())
                .language(request.getLanguage())
                .isWhitelabel(request.getIsWhitelabel())
                .orgName(request.getOrgName())
                .build();
    }
}
