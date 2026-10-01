package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.feature.rewards.enums.TaskCategory;
import com.dentalstack.patient.feature.rewards.enums.TaskFrequency;
import com.dentalstack.patient.feature.rewards.enums.TaskType;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaskConfigResponse {
    private Long id;
    private String taskIdentifier;
    private String taskName;
    private String taskDescription;
    private TaskType taskType;
    private TaskCategory category;
    private TaskFrequency frequency;
    private BigDecimal coinReward;
    private Integer streakRequirement;
    private Boolean isEnabled;
    private Boolean requiresVerification;
    private Integer displayOrder;
    private String iconUrl;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
