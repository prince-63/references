package com.dentalstack.patient.feature.notification.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ResolveWebUrl {

    @Value("${spring.profiles.active}")
    private String activeProfile;

    public String resolveOrgName(String orgName) {
        if (orgName == null || orgName.isBlank()) {
            orgName = "DENTALSTACK";
        }

        String normalizedOrg = orgName.trim().toUpperCase();

        return switch (activeProfile) {
            case "dev" -> "https://web.dev.dental-stack.com";

            case "stage" -> "https://web.stage.dental-stack.com";

            case "prod" -> switch (normalizedOrg) {
                case "DENTALSTACK" -> "https://web.dental-stack.com";
                case "SMILEZY" -> "https://web.smilezy.com";
                case "CRAFTALIGN" -> "https://web.craftalign.com";
                case "ROUTETOSMILE" -> "https://web.routetosmile.com";
                case "SYNAPSE" -> "https://web.synapsehealthtech.in";
                case "CLEARCASTLE" -> "https://doctors.clearcastle.in";
                case "SMILEXCEL" -> "https://doctors.smilexcel.com";
                case "AIIQALIGNER" -> "https://doctors.aiiqaligner.com";
                case "CONFIDENTALIGNER" -> "https://confialign.confidentlab.com";
                default -> "https://web.dental-stack.com";
            };

            default -> "https://web.dental-stack.com";
        };
    }
}
