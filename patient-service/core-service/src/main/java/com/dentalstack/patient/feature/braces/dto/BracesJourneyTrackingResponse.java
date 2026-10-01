package com.dentalstack.patient.feature.braces.dto;

import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BracesJourneyTrackingResponse {

    private boolean isEnabled;
    private BracesTreatmentStage status;
    private Long bracesJourneyId;
    private Boolean isTreatmentStarted;

    public static BracesJourneyTrackingResponse from(BracesJourney bracesJourney) {
        return BracesJourneyTrackingResponse.builder()
                .isEnabled(bracesJourney != null
                        && bracesJourney.getBracesTreatmentStage().equals(BracesTreatmentStage.ACTIVE))
                .status(bracesJourney != null ? bracesJourney.getBracesTreatmentStage() : null)
                .bracesJourneyId(bracesJourney != null ? bracesJourney.getId() : null)
                .isTreatmentStarted(bracesJourney != null && bracesJourney.getIsTreatmentStarted())
                .build();
    }
}
