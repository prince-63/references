package com.dentalstack.patient.feature.aligner.dto.aligner.feedback;

import com.dentalstack.patient.feature.aligner.entity.AlignerFeedback;
import com.dentalstack.patient.feature.user.enums.UserType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(name = "Misc aligner feedback details")
public class MiscAlignerFeedbackDetails {
    private Long alignerFeedbackId;
    private Long feedbackerUserId;
    private UserType feedbackerUserType;
    private ZonedDateTime createdAt;

    private String feedbackMessage;

    @Nullable
    private Long replyToAlignerFeedback;

    private String senderName;
    private String senderProfileImageUrl;

    public static MiscAlignerFeedbackDetails from(
            AlignerFeedback feedback, String senderName, String senderProfileImageUrl) {
        var details = (com.dentalstack.patient.feature.timeline.metadata.feedback.MiscAlignerFeedbackDetails)
                feedback.getFeedback();

        return new MiscAlignerFeedbackDetails(
                feedback.getId(),
                feedback.getFeedbackerUserId(),
                feedback.getFeedbackerUserType(),
                feedback.getCreatedAt(),
                details.getFeedbackMessage(),
                details.getReplyToAlignerFeedback(),
                senderName,
                senderProfileImageUrl);
    }
}
