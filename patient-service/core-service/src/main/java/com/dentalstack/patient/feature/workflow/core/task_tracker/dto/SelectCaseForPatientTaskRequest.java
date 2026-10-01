package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.TaskType;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SelectCaseForPatientTaskRequest {
    private Long manufacturingId;

    private String orderType;
    private String workflowName;
    private String workflowStatusName;

    private String orderId;
    private Long patientId;
    private Long profileId;
    private JsonNode serviceProducts;
    private String labWorkflowName;
    private String labOrderType;
    private String labWorkflowStatusName;
    private TaskType caseType;
    private Long labProfileId;
    private Long organizationId;
    private Long doctorId;
    private Long taskId;
    private Long serviceProductId;

    private String vspManufacturingId;
    private String vspOrderId;
}
