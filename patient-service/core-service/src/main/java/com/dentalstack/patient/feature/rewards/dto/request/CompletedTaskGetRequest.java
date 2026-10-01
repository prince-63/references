package com.dentalstack.patient.feature.rewards.dto.request;

import com.dentalstack.patient.feature.rewards.enums.TaskCategory;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompletedTaskGetRequest {
    private Long patientId;
    private TaskCategory category;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer alignerNo;
}
