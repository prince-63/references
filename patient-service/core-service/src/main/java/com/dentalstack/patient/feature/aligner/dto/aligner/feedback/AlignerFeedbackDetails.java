package com.dentalstack.patient.feature.aligner.dto.aligner.feedback;

import com.dentalstack.patient.feature.aligner.entity.AlignerFeedback;
import com.dentalstack.patient.feature.timeline.metadata.feedback.AlignerFeedbackType;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.io.Serial;
import java.io.Serializable;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerFeedbackDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long alignerFeedbackId;
    private ZonedDateTime createdAt;
    private Long feedbackerUserId;
    private UserType feedbackerUserType;
    private AlignerFeedbackType feedbackType;
    private com.dentalstack.patient.feature.timeline.metadata.feedback.AlignerFeedbackDetails feedback;

    public static AlignerFeedbackDetails from(AlignerFeedback alignerFeedback) {
        return AlignerFeedbackDetails.builder()
                .alignerFeedbackId(alignerFeedback.getId())
                .createdAt(alignerFeedback.getCreatedAt())
                .feedbackerUserId(alignerFeedback.getFeedbackerUserId())
                .feedbackerUserType(alignerFeedback.getFeedbackerUserType())
                .feedbackType(alignerFeedback.getFeedbackType())
                .feedback(alignerFeedback.getFeedback())
                .build();
    }
}
