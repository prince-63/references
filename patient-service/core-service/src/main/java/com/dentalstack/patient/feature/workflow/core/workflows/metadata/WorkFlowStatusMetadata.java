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
public class WorkFlowStatusMetadata extends WorkFlowManagementMetadata implements Serializable {

    private Long profileId;
    private Long statusId;
    private String name;
    private String labelName;
    private String color;
    private Integer position;
    private Boolean custom;
    private Boolean nonDeletable;

    @JsonCreator
    public WorkFlowStatusMetadata(
            @JsonProperty("profileId") Long profileId,
            @JsonProperty("statusId") Long statusId,
            @JsonProperty("name") String name,
            @JsonProperty("labelName") String labelName,
            @JsonProperty("color") String color,
            @JsonProperty("position") Integer position,
            @JsonProperty("custom") Boolean custom,
            @JsonProperty("nonDeletable") Boolean nonDeletable) {
        super(WorkFlowManagementMetadataType.WORKFLOW_STATUS);
        this.profileId = profileId;
        this.statusId = statusId;
        this.name = name;
        this.labelName = labelName;
        this.color = color;
        this.position = position;
        this.custom = custom;
        this.nonDeletable = nonDeletable;
    }
}
