package com.dentalstack.patient.global.utils;

import java.util.Arrays;
import java.util.stream.Collectors;

public class PlanUtils {
    public static String formatPlanName(String originalPlanName) {
        if (originalPlanName == null) return null;

        return Arrays.stream(originalPlanName.split("_"))
                .map(word ->
                        word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

    public static String formatPlanForDisplay(String planName) {
        if (planName == null) return null;

        return switch (planName.toUpperCase()) {
            case "STARTER" -> "Starter Plan";
            case "GROWTH" -> "Growth Plan";
            case "PROFESSIONAL" -> "Professional Plan";
            case "DESIGN_LAB" -> "Design lab";
            default -> planName;
        };
    }
}
