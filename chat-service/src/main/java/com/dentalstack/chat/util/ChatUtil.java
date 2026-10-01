package com.dentalstack.chat.util;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@RequiredArgsConstructor
@Service
public class ChatUtil {
    public static String mapOrgName(String brand) {
        if (StringUtils.hasText(brand)) {
            return switch (brand.toUpperCase().trim()) {
                case "SMILEZY" -> "Smilezy";
                case "ALIGNEAZY" -> "Aligneazy";
                case "SMILECAPS" -> "Smilecaps";
                case "EVOLVALIGN" -> "Evolvalign";
                case "CRAFTALIGN" -> "Craftalign";
                case "ROUTETOSMILE" -> "RouteToSmile";
                case "ROUTETOSMILEVSP" -> "RouteToSmileVsp";
                case "CLEARCASTLE" -> "ClearCastle";
                case "SYNAPSE" -> "Synapse";
                case "AMEND" -> "Amend";
                case "SMILEXCEL" -> "SmilExcel";
                case "AIIQALIGNER" -> "AiiqAligner";
                case "CONFIDENTALIGNER" -> "ConfidentAligner";
                default -> "Dental Stack";
            };
        }
        return "Dental Stack";
    }

    public static boolean shouldUseSecondaryAccount(String orgName) {
        return "CRAFTALIGN".equalsIgnoreCase(orgName);
    }

    public static String formatTimeWithZone(LocalTime time) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
        return time.format(formatter) + " IST";
    }

    public static String formatDateWithSuffix(LocalDate date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMM yyyy");
        String formattedDate = date.format(formatter);

        // Adding the day suffix (st, nd, rd, th)
        int day = date.getDayOfMonth();
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
