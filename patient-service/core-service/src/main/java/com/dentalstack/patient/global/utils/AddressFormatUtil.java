package com.dentalstack.patient.global.utils;

import java.util.StringJoiner;

public final class AddressFormatUtil {

    private AddressFormatUtil() {}

    public static String formatAddress(
            String addressedTo,
            String name,
            String addressLine,
            String city,
            String state,
            String country,
            String pincode) {
        StringJoiner joiner = new StringJoiner(", ");
        addIfPresent(joiner, addressedTo);
        addIfPresent(joiner, name);
        addIfPresent(joiner, addressLine);
        addIfPresent(joiner, city);
        addIfPresent(joiner, state);
        addIfPresent(joiner, country);
        addIfPresent(joiner, pincode);
        return joiner.toString();
    }

    private static void addIfPresent(StringJoiner joiner, String value) {
        if (value != null && !value.isBlank()) {
            joiner.add(value);
        }
    }
}
