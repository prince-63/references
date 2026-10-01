package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.feature.rewards.enums.TaskCompletionStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaskCompletionResponse {
    private Long completionId;
    private String taskName;
    private BigDecimal coinsEarned;
    private TaskCompletionStatus status;
    private LocalDateTime completedAt;
    private String message;
}
