package com.dentalstack.patient.feature.workflow.core.workflows.enums;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import lombok.Getter;

@Getter
public enum WorkflowConfig {
    ALIGNER_MANUFACTURING(Collections.emptyList()),
    MANUFACTURING(Arrays.asList("ONGOING PRODUCT LIST", "Production Outsource", "Production In House")),
    PLANNING(Arrays.asList("Planning In House", "Plan Outsourced"));

    private final List<String> allowedWorkflowNames;

    WorkflowConfig(List<String> allowedWorkflowNames) {
        this.allowedWorkflowNames = allowedWorkflowNames;
    }

    public boolean shouldFilterByName() {
        return !allowedWorkflowNames.isEmpty();
    }
}
