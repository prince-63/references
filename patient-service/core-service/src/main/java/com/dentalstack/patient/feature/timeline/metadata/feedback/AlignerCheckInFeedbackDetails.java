package com.dentalstack.patient.feature.timeline.metadata.feedback;

import com.dentalstack.patient.feature.aligner.dto.aligner.action.AlignerFeedbackRequest;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serial;
import java.io.Serializable;
import java.util.Map;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AlignerCheckInFeedbackDetails extends AlignerFeedbackDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Map<JawType, AlignerFeedbackRequest.AlignerFeedbackDetails> feedbacks;
    private String otherIssues;

    @JsonCreator
    public AlignerCheckInFeedbackDetails(
            Map<JawType, AlignerFeedbackRequest.AlignerFeedbackDetails> feedbacks, String otherIssues) {
        super(AlignerFeedbackType.ALIGNER_CHECK_IN);
        this.feedbacks = feedbacks;
        this.otherIssues = otherIssues;
    }
}
