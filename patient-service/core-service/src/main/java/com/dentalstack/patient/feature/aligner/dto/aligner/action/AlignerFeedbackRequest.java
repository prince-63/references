package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.timeline.metadata.feedback.AlignerChangingFeedback;
import com.dentalstack.patient.feature.timeline.metadata.feedback.AlignerFittingFeedback;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.Serial;
import java.io.Serializable;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AlignerFeedbackRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Map<JawType, AlignerFeedbackDetails> feedbacks;
    private String otherIssues;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Schema(title = "Aligner feedback")
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class AlignerFeedbackDetails implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private AlignerFittingFeedback fittingFeedback;
        private AlignerChangingFeedback changingFeedback;
    }
}
