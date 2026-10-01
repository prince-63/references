package com.dentalstack.patient.feature.workflow.mytask.dto;

import com.dentalstack.patient.feature.workflow.mytask.enums.MyTaskPriority;
import com.dentalstack.patient.feature.workflow.mytask.enums.MyTaskStatus;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class MyTaskRequestDTO {
    private Long patientId;
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
