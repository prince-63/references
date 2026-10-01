package com.dentalstack.patient.feature.rewards.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientTaskListResponse {
    private List<PatientTaskResponse> dailyTasks;
    private List<PatientTaskResponse> milestones;
    private List<PatientTaskResponse> wellnessChecks;
    private int totalCount;
}
