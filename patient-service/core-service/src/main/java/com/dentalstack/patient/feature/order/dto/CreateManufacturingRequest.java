package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.order.enums.BatchType;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.TaskType;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.annotation.Nullable;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateManufacturingRequest {
    private ManufacturingStatus status;
    private Long patientId;
    private Integer upperAlignerStart;
    private Integer upperAlignerEnd;
    private Integer lowerAlignerStart;
    private Integer lowerAlignerEnd;
    private Integer totalAligners;
    private BatchType batchType;
    private Long treatmentPlanId;
    private LocalDate deliveryDate;
    private Long profileId;

    @Nullable
    private TaskType taskType;

    @Nullable
    private JsonNode serviceProducts;

    @Nullable
    private Long serviceProductId;

    @Nullable
    private String instructions;

    private Long outsourceLabProfileId;
    private Boolean isNextBatch;
}
