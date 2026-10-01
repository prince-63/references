package com.dentalstack.patient.feature.feedback.dto.feedback;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddFeedbackRequest {
    private Long patientId;

    @Min(0)
    @Max(10)
    private int rating;

    @Min(0)
    @Max(10)
    private int satisfactionLevel;

    private boolean recommendTheAppToOthers;
    private String suggestions;
}
