package com.dentalstack.chat.util;

import org.springframework.stereotype.Component;

@Component
public class StringUtil {
    public String capitalizeWords(String str) {
        if (str == null || str.isBlank()) {
            return str;
        }

        String[] words = str.trim().split("\\s+");
        StringBuilder result = new StringBuilder();

        for (String word : words) {
            result.append(word.substring(0, 1).toUpperCase())
                    .append(word.substring(1).toLowerCase())
                    .append(" ");
        }

        return result.toString().trim();
    }
}
