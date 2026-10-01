package com.dentalstack.patient.feature.aligner.projection;

import com.dentalstack.patient.feature.aligner.dto.AlignerInfo;
import java.time.LocalDate;

public interface UnprocessedAlignerProjection {

    Long getTreatmentPlanId();

    String getTreatmentPlanStatus();

    Long getPatientId();

    String getPatientFirstName();

    String getPatientLastName();

    String getPatientEmail();

    String getPatientProfilePictureUrl();

    Long getOrderId();

    LocalDate getOrderDueBy();

    String getOrganizationName();

    Integer getUpperJawStartsWith();

    Integer getUpperJawEndsWith();

    Integer getLowerJawStartsWith();

    Integer getLowerJawEndsWith();

    Integer getDeliveredCount();

    Integer getDeliveredUpperStart();

    Integer getDeliveredUpperEnd();

    Integer getDeliveredLowerStart();

    Integer getDeliveredLowerEnd();

    Integer getInventoryCount();

    Integer getInventoryUpperStart();

    Integer getInventoryUpperEnd();

    Integer getInventoryLowerStart();

    Integer getInventoryLowerEnd();

    Integer getTransitCount();

    Integer getTransitUpperStart();

    Integer getTransitUpperEnd();

    Integer getTransitLowerStart();

    Integer getTransitLowerEnd();

    default String getPatientFullName() {
        return (getPatientFirstName() != null ? getPatientFirstName() : "") + " "
                + (getPatientLastName() != null ? getPatientLastName() : "");
    }

    default AlignerInfo getTotalAligners() {
        int upperStart = getUpperJawStartsWith() != null ? getUpperJawStartsWith() : 0;
        int upperEnd = getUpperJawEndsWith() != null ? getUpperJawEndsWith() : 0;
        int lowerStart = getLowerJawStartsWith() != null ? getLowerJawStartsWith() : 0;
        int lowerEnd = getLowerJawEndsWith() != null ? getLowerJawEndsWith() : 0;

        int upperCount = upperEnd > upperStart ? (upperEnd - upperStart + 1) : 0;
        int lowerCount = lowerEnd > lowerStart ? (lowerEnd - lowerStart + 1) : 0;
        int totalCount = upperCount + lowerCount;

        return AlignerInfo.builder()
                .count(totalCount)
                .upperRangeStart(upperStart)
                .upperRangeEnd(upperEnd)
                .lowerRangeStart(lowerStart)
                .lowerRangeEnd(lowerEnd)
                .build();
    }

    default AlignerInfo getDeliveredAligners() {
        return AlignerInfo.builder()
                .count(getDeliveredCount() != null ? getDeliveredCount() : 0)
                .upperRangeStart(getDeliveredUpperStart() != null ? getDeliveredUpperStart() : 0)
                .upperRangeEnd(getDeliveredUpperEnd() != null ? getDeliveredUpperEnd() : 0)
                .lowerRangeStart(getDeliveredLowerStart() != null ? getDeliveredLowerStart() : 0)
                .lowerRangeEnd(getDeliveredLowerEnd() != null ? getDeliveredLowerEnd() : 0)
                .build();
    }

    default AlignerInfo getInventoryAligners() {
        return AlignerInfo.builder()
                .count(getInventoryCount() != null ? getInventoryCount() : 0)
                .upperRangeStart(getInventoryUpperStart() != null ? getInventoryUpperStart() : 0)
                .upperRangeEnd(getInventoryUpperEnd() != null ? getInventoryUpperEnd() : 0)
                .lowerRangeStart(getInventoryLowerStart() != null ? getInventoryLowerStart() : 0)
                .lowerRangeEnd(getInventoryLowerEnd() != null ? getInventoryLowerEnd() : 0)
                .build();
    }

    default AlignerInfo getTransitAligners() {
        return AlignerInfo.builder()
                .count(getTransitCount() != null ? getTransitCount() : 0)
                .upperRangeStart(getTransitUpperStart() != null ? getTransitUpperStart() : 0)
                .upperRangeEnd(getTransitUpperEnd() != null ? getTransitUpperEnd() : 0)
                .lowerRangeStart(getTransitLowerStart() != null ? getTransitLowerStart() : 0)
                .lowerRangeEnd(getTransitLowerEnd() != null ? getTransitLowerEnd() : 0)
                .build();
    }
}
