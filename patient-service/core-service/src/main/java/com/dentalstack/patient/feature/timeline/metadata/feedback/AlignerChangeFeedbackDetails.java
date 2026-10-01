package com.dentalstack.patient.feature.timeline.metadata.feedback;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
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
public class AlignerChangeFeedbackDetails extends AlignerFeedbackDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private JawType jawType;
    private AlignerFittingFeedback alignerFittingFeedback;
    private AlignerChangingFeedback alignerChangingFeedback;
    private String otherIssues;

    @JsonCreator
    public AlignerChangeFeedbackDetails(
            JawType jawType,
            AlignerFittingFeedback alignerFittingFeedback,
            AlignerChangingFeedback alignerChangingFeedback,
            String otherIssues) {
        super(AlignerFeedbackType.ALIGNER_CHANGE);
        this.jawType = jawType;
        this.alignerFittingFeedback = alignerFittingFeedback;
        this.alignerChangingFeedback = alignerChangingFeedback;
        this.otherIssues = otherIssues;
    }
}
