package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientTaskFilterRequest {
    private Long orgId;
    private String query;
    private Long createdById;
    private String product;
    private String caseType;
    private String clinic;
    private List<Long> assigneeIds;
    private String orderType;
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
    private String workflowName;

    private String sortBy;
    private String sortDir;
}
