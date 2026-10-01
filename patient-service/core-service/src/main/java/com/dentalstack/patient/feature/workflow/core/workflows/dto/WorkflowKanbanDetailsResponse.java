package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.LabelCountResponse;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowKanbanDetailsResponse {
    private String kanbanName;
    private String workflowLabelName;
    private List<LabelCountResponse> statusLabels;
    private Long totalCount;
}
