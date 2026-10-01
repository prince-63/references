package com.dentalstack.patient.feature.aligner.dto.aligner.feedback;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.timeline.metadata.feedback.AlignerChangingFeedback;
import com.dentalstack.patient.feature.timeline.metadata.feedback.AlignerFeedbackType;
import com.dentalstack.patient.feature.timeline.metadata.feedback.AlignerFittingFeedback;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AlignerChangeFeedbackRequest {
    private JawType jawType;
    private AlignerFeedbackType feedbackType;
    private AlignerFittingFeedback fittingFeedbacks;
    private AlignerChangingFeedback changingFeedbacks;
    private String otherIssues;
    private Long profileId;
}
