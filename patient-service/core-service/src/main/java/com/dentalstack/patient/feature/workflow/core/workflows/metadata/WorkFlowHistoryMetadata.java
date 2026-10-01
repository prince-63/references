package com.dentalstack.patient.feature.workflow.core.workflows.metadata;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class WorkFlowHistoryMetadata extends WorkFlowManagementMetadata implements Serializable {

    private Long profileId;
    private Long workFlowId;
    private String action;
    private Long performedBy;
    private Long performedAt;

    @JsonCreator
    public WorkFlowHistoryMetadata(
            @JsonProperty("profileId") Long profileId,
            @JsonProperty("workFlowId") Long workFlowId,
            @JsonProperty("action") String action,
            @JsonProperty("performedBy") Long performedBy,
            @JsonProperty("performedAt") Long performedAt) {
        super(WorkFlowManagementMetadataType.WORKFLOW_HISTORY);
        this.profileId = profileId;
        this.workFlowId = workFlowId;
        this.action = action;
        this.performedBy = performedBy;
        this.performedAt = performedAt;
    }
}
