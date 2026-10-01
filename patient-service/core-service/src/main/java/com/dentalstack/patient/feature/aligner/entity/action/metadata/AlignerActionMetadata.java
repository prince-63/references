package com.dentalstack.patient.feature.aligner.entity.action.metadata;

import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
        value = {
            @JsonSubTypes.Type(value = AlignerChangeActionMetadata.class, name = "ALIGNER_CHANGE"),
            @JsonSubTypes.Type(value = AlignerIssueActionMetadata.class, name = "ISSUE_REPORT"),
            @JsonSubTypes.Type(value = AlignerCheckInMetadata.class, name = "CHECK_IN"),
            @JsonSubTypes.Type(value = MoveToPreviousAlignerActionMetadata.class, name = "MOVE_TO_PREVIOUS_ALIGNER"),
        })
@AllArgsConstructor
@Data
public abstract class AlignerActionMetadata implements Serializable {
    private final AlignerActionType type;
}
