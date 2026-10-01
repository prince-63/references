package com.dentalstack.chat.util;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtils {

    public static String formatZonedTimeWithZone(ZonedDateTime zonedDateTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a z");
        return zonedDateTime.format(formatter); // e.g., "04:45 PM IST"
    }

    public static String formatZonedDateWithSuffix(ZonedDateTime zonedDateTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMM yyyy");
        String formattedDate = zonedDateTime.format(formatter);

        int day = zonedDateTime.getDayOfMonth();
        String dayWithSuffix = addDaySuffix(day);

        return formattedDate.replaceFirst("\\d+", dayWithSuffix);
    }

    public static String addDaySuffix(int day) {
        if (day >= 11 && day <= 13) {
            return day + "th";
        }

        return switch (day % 10) {
            case 1 -> day + "st";
            case 2 -> day + "nd";
            case 3 -> day + "rd";
            default -> day + "th";
        };
    }
}
