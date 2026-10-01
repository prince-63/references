package com.dentalstack.patient.feature.rewards.dto.request;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class UpdateTaskConfigRequest {
    private String taskName;
    private String taskDescription;
    private BigDecimal coinReward;
    private Boolean requiresVerification;
    private Integer displayOrder;
    private Long profileId;
    private Long taskId;
}
