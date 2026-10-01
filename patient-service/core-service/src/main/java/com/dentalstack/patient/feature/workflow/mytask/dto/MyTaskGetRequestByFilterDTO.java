package com.dentalstack.patient.feature.workflow.mytask.dto;

import com.dentalstack.patient.feature.workflow.mytask.enums.MyTaskSortOrder;
import com.dentalstack.patient.feature.workflow.mytask.enums.MyTaskStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class MyTaskGetRequestByFilterDTO extends MyTaskGetRequestDTO {
    private Long profileId;
    private Long patientId;
    private Long assigneeProfileId;
    private MyTaskStatus filter;
    private MyTaskSortOrder order;
}
