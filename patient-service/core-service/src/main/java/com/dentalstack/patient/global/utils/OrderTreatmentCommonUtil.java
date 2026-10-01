package com.dentalstack.patient.global.utils;

import com.dentalstack.patient.feature.treatment.entity.AlignerDetailsMetadata;
import java.util.List;

public final class OrderTreatmentCommonUtil {

    private OrderTreatmentCommonUtil() {}

    public static int getTotalAligners(AlignerDetailsMetadata metadata) {
        int totalAligners = 0;

        if (metadata != null) {
            List<Integer> lowerJawRange = metadata.getLowerJawDetails().getRange();
            List<Integer> upperJawRange = metadata.getUpperJawDetails().getRange();

            int lowerCount = 0;
            int upperCount = 0;

            if (lowerJawRange != null) {
                lowerCount = lowerJawRange.size();
            }

            if (upperJawRange != null) {
                upperCount = upperJawRange.size();
            }

            totalAligners = lowerCount + upperCount;
        }

        return totalAligners;
    }

    public static String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }

        str = str.replace("_", "-");

        String[] parts = str.split("-");
        StringBuilder capitalized = new StringBuilder();

        for (String part : parts) {
            if (!part.isEmpty()) {
                capitalized
                        .append(part.substring(0, 1).toUpperCase())
                        .append(part.substring(1).toLowerCase())
                        .append("-");
            }
        }

        return capitalized.substring(0, capitalized.length() - 1);
    }
}
