package com.dentalstack.patient.feature.aligner.entity.action;

import com.dentalstack.patient.feature.aligner.dto.aligner.action.ValidateAlignerChangeRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.ReportAlignerIssueRequest;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerFeedback;
import com.dentalstack.patient.feature.aligner.entity.AlignerPhoto;
import com.dentalstack.patient.feature.aligner.entity.action.metadata.*;
import com.dentalstack.patient.feature.aligner.enums.aligner.action.AlignerUpdateCategory;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
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

    @Column(columnDefinition = "text")
    private String issueReportedRemark;

    public static AlignerAction alignerChangeByPatient(
            long patientId,
            Aligner previousAligner,
            long newAlignerId,
            List<AlignerPhoto> previousAlignerPhotos,
            List<AlignerPhoto> newAlignerPhotos,
            List<Long> previousAlignerFeedbackIds) {
        var metadata = AlignerChangeActionMetadata.builder()
                .previousAlignerFeedbackIds(previousAlignerFeedbackIds)
                .newAlignerId(newAlignerId)
                .previousAlignerId(previousAligner.getId())
                .newAlignerPhotoIds(
                        newAlignerPhotos.stream().map(AlignerPhoto::getId).toList())
                .previousAlignerPhotoIds(
                        previousAlignerPhotos.stream().map(AlignerPhoto::getId).toList())
                .changeDate(LocalDate.now())
                .alignerEndDate(previousAligner.getEndDate())
                .alignerStartDate(previousAligner.getStartDate())
                .build();

        return AlignerAction.builder()
                .aligner(previousAligner)
                .performedBy(patientId)
                .performedByUserType(UserType.PATIENT)
                .type(AlignerActionType.ALIGNER_CHANGE)
                .performedAt(ZonedDateTime.now())
                .metadata(metadata)
                .updateCategory(AlignerUpdateCategory.NEW)
                .isActive(true)
                .build();
    }

    public static AlignerAction alignerChangeByPatient(long patientId, Aligner previousAligner, long newAlignerId) {
        var metadata = AlignerChangeActionMetadata.builder()
                .newAlignerId(newAlignerId)
                .previousAlignerId(previousAligner.getId())
                .changeDate(LocalDate.now())
                .alignerEndDate(previousAligner.getEndDate())
                .alignerStartDate(previousAligner.getStartDate())
                .build();

        return AlignerAction.builder()
                .aligner(previousAligner)
                .performedBy(patientId)
                .performedByUserType(UserType.PATIENT)
                .type(AlignerActionType.ALIGNER_CHANGE)
                .performedAt(ZonedDateTime.now())
                .metadata(metadata)
                .updateCategory(AlignerUpdateCategory.NEW)
                .isActive(true)
                .build();
    }

    public static AlignerAction alignerCheckInByPatient(
            long patientId, Aligner aligner, List<AlignerPhoto> alignerPhotos, @Nullable AlignerFeedback feedback) {
        var metadata = AlignerCheckInMetadata.builder()
                .alignerId(aligner.getId())
                .alignerFeedbackIds(feedback != null ? List.of(feedback.getId()) : null)
                .alignerPhotoIds(alignerPhotos.stream().map(AlignerPhoto::getId).toList())
                .build();
        var updateCategory = AlignerUpdateCategory.NEW;
        String updateCategoryReason = null;
        if (alignerPhotos.isEmpty()) {
            updateCategory = AlignerUpdateCategory.CRITICAL;
            updateCategoryReason = "No photos uploaded";
        }
        if (feedback != null && feedback.isCritical()) {
            updateCategory = AlignerUpdateCategory.CRITICAL;
            if (updateCategoryReason != null) {
                updateCategoryReason += ", Feedback needs review";
            } else {
                updateCategoryReason = "Feedback needs review";
            }
        }

        return AlignerAction.builder()
                .aligner(aligner)
                .performedBy(patientId)
                .performedByUserType(UserType.PATIENT)
                .type(AlignerActionType.CHECK_IN)
                .performedAt(ZonedDateTime.now())
                .metadata(metadata)
                .updateCategory(updateCategory)
                .updateCategoryReason(updateCategoryReason)
                .isActive(true)
                .build();
    }

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
                .changeDate(LocalDate.now())
                .alignerEndDate(previousAligner.getEndDate())
                .alignerStartDate(previousAligner.getStartDate())
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
                .validated(true)
                .build();
    }

    public static AlignerAction newIssueReportAction(ReportAlignerIssueRequest request, Aligner aligner) {
        var metadata = AlignerIssueActionMetadata.builder()
                .issue(request.getAlignerIssue())
                .otherIssues(request.getOtherIssues())
                .build();

        return AlignerAction.builder()
                .aligner(aligner)
                .performedBy(request.getUserId())
                .performedByUserType(request.getUserType())
                .type(AlignerActionType.ISSUE_REPORT)
                .performedAt(ZonedDateTime.now())
                .metadata(metadata)
                .updateCategory(AlignerUpdateCategory.NEW)
                .isActive(true)
                .build();
    }

    public static AlignerAction newMoveToPreviousAligner(
            Aligner aligner, long doctorId, long previousAlignerId, long newAlignerId, String reason) {

        var metadata = MoveToPreviousAlignerActionMetadata.builder()
                .previousAlignerId(previousAlignerId)
                .newAlignerId(newAlignerId)
                .moveToPreviousAlignerReason(reason)
                .build();

        return AlignerAction.builder()
                .aligner(aligner)
                .performedBy(doctorId)
                .performedByUserType(UserType.DOCTOR)
                .performedAt(ZonedDateTime.now())
                .type(AlignerActionType.MOVE_TO_PREVIOUS_ALIGNER)
                .updateCategory(AlignerUpdateCategory.NORMAL)
                .metadata(metadata)
                .isActive(true)
                .validatedBy(doctorId)
                .validated(true)
                .build();
    }

    public void updateValidationDetails(ValidateAlignerChangeRequest request) {
        this.validated = true;
        this.validatedBy = request.getValidatedBy();
        this.validatedByUserType = request.getValidatedByUserType();
        this.validatedAt = ZonedDateTime.now();
        this.updateCategory = AlignerUpdateCategory.APPROVED;
        this.issueReportedRemark = request.getRemarks();
        this.isActive = false;
    }
}
