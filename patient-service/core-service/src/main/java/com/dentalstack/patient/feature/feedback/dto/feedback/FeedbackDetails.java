package com.dentalstack.patient.feature.feedback.dto.feedback;

import com.dentalstack.patient.feature.feedback.entity.Feedback;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackDetails {
    private long patientId;
    private int rating;
    private int satisfactionLevel;
    private boolean recommendTheAppToOthers;
    private String suggestions;
    private boolean active;

    public static FeedbackDetails from(Feedback feedback) {
        return new FeedbackDetails(
                feedback.getPatient().getId(),
                feedback.getRating(),
                feedback.getSatisfactionLevel(),
                feedback.isRecommendTheAppToOthers(),
                feedback.getSuggestions(),
                feedback.isActive());
    }
}
