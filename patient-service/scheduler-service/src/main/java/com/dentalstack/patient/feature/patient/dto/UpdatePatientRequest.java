package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdatePatientRequest {
    @NotNull
    private Long id;

    private String firstName;
    private String lastName;
    private String middleName;
    private Integer age;
    private String email;
    private String mobile;
    private String gender;
    private String country;
    private String city;
    private String state;

    @Nullable
    private CountryCode countryCode;
}
