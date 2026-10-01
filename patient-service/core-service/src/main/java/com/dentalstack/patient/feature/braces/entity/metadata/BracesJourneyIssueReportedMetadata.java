package com.dentalstack.patient.feature.braces.entity.metadata;

import com.dentalstack.patient.feature.braces.entity.enums.BracesJourneyIssuesEnum;
import com.dentalstack.patient.feature.braces.entity.enums.BracesJourneyType;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.lang.Nullable;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class BracesJourneyIssueReportedMetadata extends BracesJourneyMetadata {
    private List<BracesJourneyIssuesEnum> issues;

    @Nullable
    private String otherIssues;

    @JsonCreator
    public BracesJourneyIssueReportedMetadata(List<BracesJourneyIssuesEnum> issues, @Nullable String otherIssues) {
        super(BracesJourneyType.ISSUE_REPORTED);
        this.issues = issues;
        this.otherIssues = otherIssues;
    }
}
