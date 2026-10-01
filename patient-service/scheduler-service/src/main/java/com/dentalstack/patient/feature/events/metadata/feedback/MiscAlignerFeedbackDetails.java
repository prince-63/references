package com.dentalstack.patient.feature.events.metadata.feedback;

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
public class MiscAlignerFeedbackDetails extends AlignerFeedbackDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String feedbackMessage;
    private Long replyToAlignerFeedback;

    @JsonCreator
    public MiscAlignerFeedbackDetails(String feedbackMessage, Long replyToAlignerFeedback) {
        super(AlignerFeedbackType.MISC);
        this.feedbackMessage = feedbackMessage;
        this.replyToAlignerFeedback = replyToAlignerFeedback;
    }
}
