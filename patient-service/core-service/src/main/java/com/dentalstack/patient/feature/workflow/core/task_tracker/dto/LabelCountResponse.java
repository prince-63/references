package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabelCountResponse {
    private String labelName;
    private String name;
    private Long count;
}
