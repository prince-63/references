package com.dentalstack.patient.feature.feedback.dto.feedback;

import com.dentalstack.patient.feature.feedback.entity.Feedback;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Feedbacks {
    private List<FeedbackDetails> feedbacks;

    public static Feedbacks from(List<Feedback> feedbacks) {
        return new Feedbacks(feedbacks.stream().map(FeedbackDetails::from).toList());
    }
}
