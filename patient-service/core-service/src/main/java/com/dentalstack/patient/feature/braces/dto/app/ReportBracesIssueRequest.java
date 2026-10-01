package com.dentalstack.patient.feature.braces.dto.app;

import com.dentalstack.patient.feature.braces.entity.enums.BracesJourneyIssuesEnum;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportBracesIssueRequest {

    private long userId;

    private long bracesJourneyId;
    private List<BracesJourneyIssuesEnum> issues;
    private String otherIssues;
}
