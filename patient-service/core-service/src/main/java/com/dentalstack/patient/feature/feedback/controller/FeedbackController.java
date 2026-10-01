package com.dentalstack.patient.feature.feedback.controller;

import com.dentalstack.patient.feature.feedback.service.FeedbackService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "feedback", description = "Feedback APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/feedback/v1")
public class FeedbackController {

    private final FeedbackService feedbackService;
}
