package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.aligner.enums.aligner.feedback.AlignerIssue;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerIssueDetails {
    private int alignerNo;
    private String otherIssues;

    @NotNull
    private JawType jawType;

    private AlignerIssue issue;

    private ZonedDateTime performedAt;
}
