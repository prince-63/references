package com.dentalstack.patient.feature.workflow.mytask.dto;

import com.dentalstack.patient.feature.workflow.mytask.enums.MyTaskPriority;
import com.dentalstack.patient.feature.workflow.mytask.enums.MyTaskStatus;
import java.time.LocalDate;
import lombok.Data;

@Data
public class MyTaskUpdateRequest {
    private Long myTaskId;
    private Long profileId;
    private Long doctorId;
    private Long organizationId;
    private Long assigneeProfileId;
    private String title;
    private String description;
    private LocalDate dueDate;
    private MyTaskStatus status;
    private MyTaskPriority priority;
}
