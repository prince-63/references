package com.dentalstack.patient.feature.location.dto.location;

import com.dentalstack.patient.feature.location.entity.Country;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GetAllCountriesAndCodes {

    private String name;
    private String iso2;
    private String phoneCode;

    public static GetAllCountriesAndCodes from(Country country) {
        String phoneCode = country.getPhoneCode();

        if (!phoneCode.startsWith("+")) {

            phoneCode = "+" + phoneCode;
        }
        return GetAllCountriesAndCodes.builder()
                .name(country.getName())
                .iso2(country.getIso2())
                .phoneCode(phoneCode)
                .build();
    }
}
