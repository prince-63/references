package com.dentalstack.patient.feature.treatment_insights.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InsightCard {
    private Integer day;
    private String title;
    private String description;
    private Boolean isToday;
}
