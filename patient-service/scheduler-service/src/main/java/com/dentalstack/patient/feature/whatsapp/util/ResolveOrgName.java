package com.dentalstack.patient.feature.whatsapp.util;

import com.dentalstack.patient.feature.whatsapp.enums.OrgName;

public class ResolveOrgName {

    public static OrgName resolveOrgName(String orgName) {
        if (orgName == null || orgName.isBlank()) {
            return OrgName.DENTALSTACK;
        }

        return switch (orgName.trim().toUpperCase()) {
            case "ROUTETOSMILE" -> OrgName.ROUTETOSMILE;
            case "SMILEZY" -> OrgName.SMILEZY;
            case "CRAFTALIGN" -> OrgName.CRAFTALIGN;
            case "SYNAPSE" -> OrgName.SYNAPSE;
            case "CLEARCASTLE" -> OrgName.CLEARCASTLE;
            case "SMILEXCEL" -> OrgName.SMILEXCEL;
            case "AIIQALIGNER" -> OrgName.AIIQALIGNER;
            case "CONFIDENTALIGNER" -> OrgName.CONFIDENTALIGNER;
            default -> OrgName.DENTALSTACK;
        };
    }
}
