package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowCountResponse {
    private String kanbanName;
    private Long count;
}
