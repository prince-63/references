package com.dentalstack.patient.feature.aligner.dto.aligner.feedback;

import com.dentalstack.patient.feature.aligner.enums.aligner.feedback.AlignerIssue;
import com.dentalstack.patient.feature.user.enums.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportAlignerIssueRequest {
    private long userId;

    @NotNull
    private UserType userType;

    private long alignerJourneyId;
    private int alignerNo;
    private AlignerIssue alignerIssue;
    private String otherIssues;
    private Long profileId;
}
