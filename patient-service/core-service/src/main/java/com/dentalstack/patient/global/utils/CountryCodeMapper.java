package com.dentalstack.patient.global.utils;

import com.dentalstack.patient.global.enums.CountryCode;

public class CountryCodeMapper {

    public static String getPhoneCodeByCountryCode(String isoCode) {
        if (isoCode == null || isoCode.isEmpty()) {
            return null;
        }

        try {
            CountryCode country = CountryCode.valueOf(isoCode.toUpperCase());
            return country.getCode();
        } catch (IllegalArgumentException e) {

            return null;
        }
    }
}
