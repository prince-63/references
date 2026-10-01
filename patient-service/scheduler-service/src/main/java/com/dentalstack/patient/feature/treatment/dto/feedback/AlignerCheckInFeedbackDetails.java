package com.dentalstack.patient.feature.treatment.dto.feedback;

import com.dentalstack.patient.feature.treatment.dto.action.AlignerFeedbackRequest;
import com.dentalstack.patient.feature.treatment.entity.AlignerFeedback;
import com.dentalstack.patient.feature.treatment.enums.JawType;
import com.dentalstack.patient.global.enums.UserType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(name = "Aligner change feedback details")
public class AlignerCheckInFeedbackDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long alignerFeedbackId;

    @NotNull
    private Long feedbackerUserId;

    @NotNull
    private UserType feedbackerUserType;

    private ZonedDateTime createdAt;

    @Builder.Default
    private Map<JawType, AlignerFeedbackRequest.AlignerFeedbackDetails> feedbacks = new HashMap<>();

    private String otherIssues;

    public static AlignerCheckInFeedbackDetails from(AlignerFeedback f) {
        var feedback = (com.dentalstack.patient.feature.events.metadata.feedback.AlignerCheckInFeedbackDetails)
                f.getFeedback();
        return new AlignerCheckInFeedbackDetails(
                f.getId(),
                f.getFeedbackerUserId(),
                f.getFeedbackerUserType(),
                f.getCreatedAt(),
                feedback.getFeedbacks(),
                feedback.getOtherIssues());
    }
}
