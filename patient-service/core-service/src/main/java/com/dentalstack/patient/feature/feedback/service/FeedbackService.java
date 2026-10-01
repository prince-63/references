package com.dentalstack.patient.feature.feedback.service;

import com.dentalstack.patient.feature.feedback.dto.feedback.AddFeedbackRequest;
import com.dentalstack.patient.feature.feedback.entity.Feedback;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public interface FeedbackService {
    Feedback addFeedback(AddFeedbackRequest request);

    List<Feedback> getAllFeedbacksByPatient(@NotNull Long id);

    List<Feedback> getAllFeedbacks();
}
