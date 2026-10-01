package com.dentalstack.patient.global.utils;

import org.springframework.stereotype.Component;

@Component
public class StringUtil {
    public String toReadableString(String fieldName) {
        String[] parts = fieldName.split("_");
        StringBuilder readable = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].isEmpty()) continue;
            readable.append(parts[i].substring(0, 1).toUpperCase())
                    .append(parts[i].substring(1).toLowerCase());
            if (i < parts.length - 1) {
                readable.append(" ");
            }
        }
        return readable.toString();
    }

    public static String toReadable(String fieldName) {
        String[] parts = fieldName.split("_");
        StringBuilder readable = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].isEmpty()) continue;
            readable.append(parts[i].substring(0, 1)).append(parts[i].substring(1));
            if (i < parts.length - 1) {
                readable.append(" ");
            }
        }
        return readable.toString();
    }
}
