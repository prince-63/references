package com.dentalstack.patient.feature.timeline.metadata.feedback;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AlignerChangingFeedback implements Serializable {
    private List<AlignerChangingIssue> alignerChangingIssues;

    public enum AlignerChangingIssue {
        SHARP_EDGES,
        BROKEN_CRACKED_ALIGNER,
        MISSING_ALIGNER,
        IRRITATION_TO_GUMS_OR_TONGUE
    }
}
