package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.feature.rewards.entity.RewardTaskConfig;
import com.dentalstack.patient.feature.rewards.enums.TaskCategory;
import com.dentalstack.patient.feature.rewards.enums.TaskType;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PatientTaskResponse {
    private Long taskId;
    private String taskIdentifier;
    private String taskName;
    private String taskDescription;
    private TaskType taskType;
    private TaskCategory category;
    private BigDecimal coinReward;
    private Boolean isCompleted;
    private Boolean isClaimable;
    private TaskProgress progress;

    public static PatientTaskResponse from(RewardTaskConfig task, boolean isCompleted, boolean isClaimable) {
        return PatientTaskResponse.builder()
                .taskId(task.getId())
                .taskIdentifier(task.getTaskIdentifier())
                .taskName(task.getTaskName())
                .taskDescription(task.getTaskDescription())
                .taskType(task.getTaskType())
                .category(task.getCategory())
                .coinReward(task.getCoinReward())
                .isCompleted(isCompleted)
                .isClaimable(isClaimable)
                .build();
    }

    public static PatientTaskResponse from(
            RewardTaskConfig task, boolean isCompleted, boolean isClaimable, TaskProgress progress) {
        return PatientTaskResponse.builder()
                .taskId(task.getId())
                .taskIdentifier(task.getTaskIdentifier())
                .taskName(task.getTaskName())
                .taskDescription(task.getTaskDescription())
                .taskType(task.getTaskType())
                .category(task.getCategory())
                .coinReward(task.getCoinReward())
                .isCompleted(isCompleted)
                .isClaimable(isClaimable)
                .progress(progress)
                .build();
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TaskProgress {
        private Integer currentStreak;
        private Integer requiredStreak;
        private Integer remainingDays;
        private Float todayWearTimeInHours;
        private Float requiredHoursPerDay;
        private String message;
    }
}
