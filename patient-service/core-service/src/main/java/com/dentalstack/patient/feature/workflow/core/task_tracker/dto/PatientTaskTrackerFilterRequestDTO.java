package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.OrderBy;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.PatientTaskTrackerSortFilter;
import com.dentalstack.patient.global.enums.ProductTypeName;
import lombok.Data;

@Data
public class PatientTaskTrackerFilterRequestDTO {
    private Long profileId;
    private Long assigneeId;
    private String search;
    private String orderType;
    private PatientTaskTrackerSortFilter sort;
    private ProductTypeName productType;
    private OrderBy order;
    private Long serviceProductId;
    private String workflowName;
    private String workflowStatusName;

    private Long practiceLocationId;
    private Long organizationId;

    private Integer pageNumber;
    private Integer pageSize;
    private Long doctorId;
}
