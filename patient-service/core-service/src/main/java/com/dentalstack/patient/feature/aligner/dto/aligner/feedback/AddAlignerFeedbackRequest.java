package com.dentalstack.patient.feature.aligner.dto.aligner.feedback;

import com.dentalstack.patient.feature.user.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddAlignerFeedbackRequest {
    private UserType userType;
    private Long userId;
    private Long alignerJourneyId;
    private Integer AlignerNo;
    private String feedbackMessage;
    private Long replyToAlignerFeedback;
    private boolean validationFeedback;
    private Long profileId;
}
