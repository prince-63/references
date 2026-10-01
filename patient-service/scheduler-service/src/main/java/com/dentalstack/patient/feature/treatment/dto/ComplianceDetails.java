package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.treatment.entity.AlignerJourney;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ComplianceDetails {
    private int poorValue;
    private int averageValue;
    private int goodValue;

    public static ComplianceDetails from(AlignerJourney alignerJourney) {
        var goodValue = Math.floorDiv(alignerJourney.getRecommendedHoursToWearAligners() * 90, 100);
        var averageValue = Math.floorDiv(alignerJourney.getRecommendedHoursToWearAligners() * 80, 100);
        var poorValue = Math.floorDiv(alignerJourney.getRecommendedHoursToWearAligners() * 50, 100);

        return new ComplianceDetails(goodValue, averageValue, poorValue);
    }
}
