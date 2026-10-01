package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.CancelledPatientSortBy;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.OrderBy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelledPatientTaskTrackerDetailsWithFilterRequestDTO {
    private Long profileId;
    private Long organizationId;
    private Long doctorId;
    private OrderBy orderType;
    private CancelledPatientSortBy sortBy;
    private String workflowName;
    private String search;

    @Builder.Default
    private Integer pageNumber = 0;

    @Builder.Default
    private Integer pageSize = 10;
}
