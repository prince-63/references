package com.dentalstack.patient.feature.rewards.dto.request;

import com.dentalstack.patient.feature.rewards.enums.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import lombok.*;

@Data
@Builder
public class CreateTaskConfigRequest {
    @NotBlank
    private String taskIdentifier;

    @NotBlank
    private String taskName;

    private String taskDescription;

    @NotNull
    private TaskType taskType;

    @NotNull
    private TaskCategory category;

    @NotNull
    private TaskFrequency frequency;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal coinReward;

    private Integer streakRequirement;

    private Boolean requiresVerification;

    private Integer displayOrder;

    private String iconUrl;
    private Long profileId;
}
