package com.dentalstack.doctor.utils;

import com.dentalstack.doctor.enums.user.CountryCode;

public class CountryCodeMapper {

    public static String getPhoneCodeByCountryCode(String isoCode) {
        if (isoCode == null || isoCode.isEmpty()) {
            return null;
        }

        try {
            CountryCode country = CountryCode.valueOf(isoCode.toUpperCase());
            return country.getCode();
        } catch (IllegalArgumentException e) {
            // If isoCode is not a valid enum constant
            return null;
        }
    }
}
