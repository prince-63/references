package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.PatientTaskTrackerSortFilter;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientTaskTrackerRequest {
    private String orderType;
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
    private String workflowName;
    private Long serviceProductId;
    private Integer pageNumber;
    private Integer pageSize;
    private String filterByLabelName;
    private String search;
    private PatientTaskTrackerSortFilter sort;
    private List<Long> assigneeIds;
    private List<Long> productIds;
}
