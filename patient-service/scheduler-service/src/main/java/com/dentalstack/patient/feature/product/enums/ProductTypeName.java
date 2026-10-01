package com.dentalstack.patient.feature.product.enums;

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
                .map(String::toUpperCase) // Ensure case insensitivity
                .map(ProductTypeName::valueOf) // Convert string to enum
                .collect(Collectors.toList());
    }
}
