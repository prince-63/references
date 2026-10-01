package com.dentalstack.patient.feature.aligner.entity;

import com.dentalstack.patient.feature.aligner.dto.aligner.action.CheckInAlignerRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.CommentOnAlignerActionRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AddAlignerFeedbackRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AlignerChangeFeedbackRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.ReportAlignerIssueRequest;
import com.dentalstack.patient.feature.timeline.metadata.feedback.*;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "aligner_feedback",
        indexes = {
            @Index(name = "IX_aligner_feedback_aligner_id", columnList = "aligner_id"),
            @Index(name = "IX_aligner_feedback_feedbacker_user_id", columnList = "feedbackerUserId")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class AlignerFeedback extends BaseEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    private Long feedbackerUserId;

    private Long feedbackerUserProfileId;

    @NotNull
    @Enumerated(EnumType.STRING)
    private UserType feedbackerUserType;

    @NotNull
    @Enumerated(EnumType.STRING)
    private AlignerFeedbackType feedbackType;

    @NotNull
    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private AlignerFeedbackDetails feedback;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aligner_id")
    private Aligner aligner;

    public static AlignerFeedback ofTypeAlignerChangeFeedback(
            Long userId, UserType userType, AlignerChangeFeedbackRequest alignerFeedback, Aligner aligner) {
        AlignerChangeFeedbackDetails alignerChangingFeedback = AlignerChangeFeedbackDetails.builder()
                .jawType(alignerFeedback.getJawType())
                .alignerFittingFeedback(alignerFeedback.getFittingFeedbacks())
                .alignerChangingFeedback(alignerFeedback.getChangingFeedbacks())
                .otherIssues(alignerFeedback.getOtherIssues())
                .build();

        return AlignerFeedback.builder()
                .feedbackerUserId(userId)
                .feedbackerUserType(userType)
                .feedbackType(alignerFeedback.getFeedbackType())
                .feedback(alignerChangingFeedback)
                .aligner(aligner)
                .feedbackerUserProfileId(alignerFeedback.getProfileId())
                .build();
    }

    public static AlignerFeedback ofTypeMiscFeedback(AddAlignerFeedbackRequest request, Aligner aligner) {
        var userId = request.getUserId();
        var userType = request.getUserType();
        MiscAlignerFeedbackDetails alignerFeedbackDetails = MiscAlignerFeedbackDetails.builder()
                .feedbackMessage(request.getFeedbackMessage())
                .replyToAlignerFeedback(request.getReplyToAlignerFeedback())
                .build();

        return AlignerFeedback.builder()
                .feedbackerUserId(userId)
                .feedbackerUserType(userType)
                .feedbackType(AlignerFeedbackType.MISC)
                .feedback(alignerFeedbackDetails)
                .aligner(aligner)
                .feedbackerUserProfileId(request.getProfileId())
                .build();
    }

    public static AlignerFeedback ofTypeMiscFeedback(CommentOnAlignerActionRequest request, Aligner aligner) {
        var userId = request.getUserId();
        var userType = request.getUserType();
        MiscAlignerFeedbackDetails alignerFeedbackDetails = MiscAlignerFeedbackDetails.builder()
                .feedbackMessage(request.getComment())
                .replyToAlignerFeedback(request.getReplyToComment())
                .build();

        return AlignerFeedback.builder()
                .feedbackerUserId(userId)
                .feedbackerUserType(userType)
                .feedbackType(AlignerFeedbackType.MISC)
                .feedback(alignerFeedbackDetails)
                .aligner(aligner)
                .feedbackerUserProfileId(request.getProfileId())
                .build();
    }

    public static AlignerFeedback ofTypeIssueReport(ReportAlignerIssueRequest request, Aligner aligner) {
        var userId = request.getUserId();
        var userType = request.getUserType();
        AlignerIssueDetails issueDetails = AlignerIssueDetails.builder()
                .issue(request.getAlignerIssue())
                .otherIssues(request.getOtherIssues())
                .build();

        return AlignerFeedback.builder()
                .feedbackerUserId(userId)
                .feedbackerUserType(userType)
                .feedbackType(AlignerFeedbackType.ISSUE)
                .feedback(issueDetails)
                .aligner(aligner)
                .feedbackerUserProfileId(request.getProfileId())
                .build();
    }

    public static AlignerFeedback ofTypeAlignerCheckIn(CheckInAlignerRequest request, Aligner aligner) {
        var userId = request.getUserId();
        var userType = request.getUserType();
        var feedback = request.getFeedback();
        AlignerCheckInFeedbackDetails checkInFeedback = null;
        if (feedback != null) {
            checkInFeedback = AlignerCheckInFeedbackDetails.builder()
                    .feedbacks(request.getFeedback().getFeedbacks())
                    .otherIssues(request.getFeedback().getOtherIssues())
                    .build();
        }

        return AlignerFeedback.builder()
                .feedbackerUserId(userId)
                .feedbackerUserType(userType)
                .feedbackType(AlignerFeedbackType.ALIGNER_CHECK_IN)
                .feedback(checkInFeedback)
                .aligner(aligner)
                .feedbackerUserProfileId(request.getProfileId())
                .build();
    }

    public boolean isCritical() {
        return switch (feedbackType) {
            case ALIGNER_CHANGE -> {
                var details = (AlignerChangeFeedbackDetails) feedback;
                yield details.getAlignerFittingFeedback() != null
                        && (details.getAlignerFittingFeedback().getFittings().size() > 1
                                || !details.getAlignerFittingFeedback()
                                        .getFittings()
                                        .contains(AlignerFittingFeedback.Fitting.PERFECT_FIT));
            }
            case ALIGNER_CHECK_IN -> {
                var details = (AlignerCheckInFeedbackDetails) feedback;
                for (var jawType : details.getFeedbacks().keySet()) {
                    var alignerFeedbackDetails = details.getFeedbacks().get(jawType);
                    if (alignerFeedbackDetails.getFittingFeedback() != null
                                    && (alignerFeedbackDetails
                                                            .getFittingFeedback()
                                                            .getFittings()
                                                            .size()
                                                    > 1
                                            || !alignerFeedbackDetails
                                                    .getFittingFeedback()
                                                    .getFittings()
                                                    .contains(AlignerFittingFeedback.Fitting.PERFECT_FIT)
                                            || !alignerFeedbackDetails
                                                    .getChangingFeedback()
                                                    .getAlignerChangingIssues()
                                                    .isEmpty())
                            || (details.getOtherIssues() != null
                                    && !details.getOtherIssues().isEmpty())) {
                        yield true;
                    }
                }
                yield false;
            }
            default -> false;
        };
    }
}
