package com.dentalstack.patient.feature.treatment_insights.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InsightResponse {
    private Long treatmentDay;
    private Boolean standardMessage;
    private List<InsightCard> cards;
}
