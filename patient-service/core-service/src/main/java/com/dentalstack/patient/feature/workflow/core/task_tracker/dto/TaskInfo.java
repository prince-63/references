package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskInfo {
    private Long taskId;
    private Long patientId;
}
