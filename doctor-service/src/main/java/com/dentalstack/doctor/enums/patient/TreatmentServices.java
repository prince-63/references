package com.dentalstack.doctor.enums.patient;

import java.util.List;
import java.util.stream.Collectors;

public enum TreatmentServices {
    SMILESIMULATION,
    UNASSIGNED;

    public static List<TreatmentServices> fromStrings(List<String> strings) {
        return strings.stream()
                .map(String::toUpperCase)
                .map(TreatmentServices::valueOf)
                .collect(Collectors.toList());
    }
}
