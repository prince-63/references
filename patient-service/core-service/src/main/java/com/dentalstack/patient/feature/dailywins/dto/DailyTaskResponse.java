package com.dentalstack.patient.feature.dailywins.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DailyTaskResponse {
    private Long id;
    private String code;
    private String title;
    private String description;
    private Integer points;
    private Boolean completed;
}
