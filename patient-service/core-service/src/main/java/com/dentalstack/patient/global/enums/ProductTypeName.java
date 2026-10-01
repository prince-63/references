package com.dentalstack.patient.global.enums;

import java.util.List;
import java.util.stream.Collectors;

public enum ProductTypeName {
    BRACES,
    ALIGNERS,
    IMPLANTS,
    ETC,
    UNASSIGNED;

    public static List<ProductTypeName> fromStrings(List<String> strings) {
        return strings.stream()
                .map(String::toUpperCase)
                .map(ProductTypeName::valueOf)
                .collect(Collectors.toList());
    }
}
