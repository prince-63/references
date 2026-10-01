package com.dentalstack.patient.feature.workflow.core.workflows.metadata;

import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.ManufacturingMetadata;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
        value = {
            @JsonSubTypes.Type(value = WorkFlowMetadata.class, name = "WORKFLOW"),
            @JsonSubTypes.Type(value = WorkFlowHistoryMetadata.class, name = "WORKFLOW_HISTORY"),
            @JsonSubTypes.Type(value = WorkFlowStatusMetadata.class, name = "WORKFLOW_STATUS"),
            @JsonSubTypes.Type(value = WorkFlowCardDisplayMetadata.class, name = "WORKFLOW_CARD_DISPLAY"),
            @JsonSubTypes.Type(value = WorkFlowServiceProductMetadata.class, name = "WORKFLOW_SERVICE_PRODUCT"),
            @JsonSubTypes.Type(value = WorkFlowCardDisplayFieldMetadata.class, name = "WORKFLOW_CARD_DISPLAY_FIELD"),
            @JsonSubTypes.Type(value = ManufacturingMetadata.class, name = "MANUFACTURING"),
        })
@AllArgsConstructor
@NoArgsConstructor
@Data
public abstract class WorkFlowManagementMetadata implements Serializable {
    private WorkFlowManagementMetadataType type;

    public enum WorkFlowManagementMetadataType {
        WORKFLOW,
        WORKFLOW_HISTORY,
        WORKFLOW_STATUS,
        WORKFLOW_CARD_DISPLAY,
        WORKFLOW_SERVICE_PRODUCT,
        WORKFLOW_CARD_DISPLAY_FIELD,
        MANUFACTURING,
    }
}
