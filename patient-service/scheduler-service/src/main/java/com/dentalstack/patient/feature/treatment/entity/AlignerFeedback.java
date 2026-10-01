package com.dentalstack.patient.feature.treatment.entity;

import com.dentalstack.patient.feature.events.metadata.feedback.AlignerFeedbackDetails;
import com.dentalstack.patient.feature.events.metadata.feedback.AlignerFeedbackType;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.UserType;
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
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aligner_id")
    private Aligner aligner;
}
