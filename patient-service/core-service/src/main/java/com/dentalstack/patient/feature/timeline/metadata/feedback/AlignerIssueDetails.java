package com.dentalstack.patient.feature.timeline.metadata.feedback;

import com.dentalstack.patient.feature.aligner.enums.aligner.feedback.AlignerIssue;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AlignerIssueDetails extends AlignerFeedbackDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AlignerIssue issue;
    private String otherIssues;

    @JsonCreator
    public AlignerIssueDetails(AlignerIssue issue, String otherIssues) {
        super(AlignerFeedbackType.ISSUE);
        this.issue = issue;
        this.otherIssues = otherIssues;
    }
}
