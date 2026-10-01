package com.dentalstack.patient.feature.rewards.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaskConfigListResponse {
    private List<TaskConfigResponse> dailyTasks;
    private List<TaskConfigResponse> milestones;
    private List<TaskConfigResponse> wellnessChecks;

    private Integer totalCount;
}
