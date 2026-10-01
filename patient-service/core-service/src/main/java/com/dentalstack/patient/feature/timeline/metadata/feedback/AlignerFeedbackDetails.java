package com.dentalstack.patient.feature.timeline.metadata.feedback;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
        value = {
            @JsonSubTypes.Type(value = AlignerIssueDetails.class, name = "ISSUE"),
            @JsonSubTypes.Type(value = AlignerChangeFeedbackDetails.class, name = "ALIGNER_CHANGE"),
            @JsonSubTypes.Type(value = MiscAlignerFeedbackDetails.class, name = "MISC"),
            @JsonSubTypes.Type(value = AlignerCheckInFeedbackDetails.class, name = "ALIGNER_CHECK_IN")
        })
@AllArgsConstructor
@Data
public class AlignerFeedbackDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private final AlignerFeedbackType type;
}
