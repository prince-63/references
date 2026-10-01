package com.dentalstack.patient.feature.treatment.entity.action;

import com.dentalstack.patient.feature.treatment.entity.Aligner;
import com.dentalstack.patient.feature.treatment.entity.AlignerPhoto;
import com.dentalstack.patient.feature.treatment.entity.action.metadata.*;
import com.dentalstack.patient.feature.treatment.enums.action.AlignerUpdateCategory;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.UserType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "aligner_action",
        indexes = {
            @Index(name = "IX_aligner_action_aligner_id", columnList = "aligner_id"),
            @Index(name = "IX_aligner_action_performedBy", columnList = "performedBy"),
            @Index(name = "IX_aligner_action_type", columnList = "type")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class AlignerAction extends BaseEntity {
    @NotNull
    @ManyToOne
    @JoinColumn(name = "aligner_id")
    private Aligner aligner;

    private long performedBy;

    @NotNull
    @Enumerated(EnumType.STRING)
    private UserType performedByUserType;

    private ZonedDateTime performedAt;

    @NotNull
    @Enumerated(EnumType.STRING)
    private AlignerActionType type;

    @NotNull
    @Enumerated(EnumType.STRING)
    private AlignerUpdateCategory updateCategory;

    private String updateCategoryReason;

    private ZonedDateTime validatedAt;

    @Builder.Default
    private boolean validated = false;

    @Nullable
    private Long validatedBy;

    @Nullable
    @Enumerated(EnumType.STRING)
    private UserType validatedByUserType;

    @NotNull
    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private AlignerActionMetadata metadata;

    private boolean isActive;

    public static AlignerAction createForceAlignerChangeAction(
            long patientId,
            Aligner previousAligner,
            Long newAlignerId,
            List<AlignerPhoto> previousAlignerPhotos,
            List<AlignerPhoto> newAlignerPhotos,
            List<Long> previousAlignerFeedbackIds,
            AlignerActionType actionType) {

        List<Long> previousAlignerPhotoIds = previousAlignerPhotos != null
                ? previousAlignerPhotos.stream().map(AlignerPhoto::getId).toList()
                : Collections.emptyList();

        List<Long> newAlignerPhotoIds = newAlignerPhotos != null
                ? newAlignerPhotos.stream().map(AlignerPhoto::getId).toList()
                : Collections.emptyList();

        List<Long> feedbackIds =
                previousAlignerFeedbackIds != null ? previousAlignerFeedbackIds : Collections.emptyList();

        var metadata = AlignerChangeActionMetadata.builder()
                .previousAlignerFeedbackIds(feedbackIds)
                .newAlignerId(newAlignerId)
                .previousAlignerId(previousAligner.getId())
                .newAlignerPhotoIds(newAlignerPhotoIds)
                .previousAlignerPhotoIds(previousAlignerPhotoIds)
                .build();

        return AlignerAction.builder()
                .aligner(previousAligner)
                .performedBy(patientId)
                .performedByUserType(UserType.PATIENT)
                .type(actionType)
                .performedAt(ZonedDateTime.now())
                .metadata(metadata)
                .updateCategory(AlignerUpdateCategory.NEW)
                .isActive(true)
                .build();
    }
}
