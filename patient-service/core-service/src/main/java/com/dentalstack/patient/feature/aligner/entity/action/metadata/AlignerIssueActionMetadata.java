package com.dentalstack.patient.feature.aligner.entity.action.metadata;

import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.enums.aligner.feedback.AlignerIssue;
import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class AlignerIssueActionMetadata extends AlignerActionMetadata {
    private AlignerIssue issue;
    private String otherIssues;

    @JsonCreator
    public AlignerIssueActionMetadata(AlignerIssue issue, String otherIssues) {
        super(AlignerActionType.ISSUE_REPORT);
        this.issue = issue;
        this.otherIssues = otherIssues;
    }
}
