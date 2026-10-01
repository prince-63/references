package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AlignerFeedbackDetails;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerPhoto;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerChangeStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.storage.gallery.dto.AlignerPhotoDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.annotation.Nullable;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NonNull;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AlignerChangeEventEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Integer previousAlignerNo;
    private JawType previousAlignerJawType;
    private Integer newAlignerNo;
    private JawType newAlignerJawType;
    private Long alignerJourneyId;
    private LocalDate previousAlignerStartDate;
    private LocalDate previousAlignerEndDate;
    private LocalDate previousAlignerChangeDate;
    private AlignerChangeStatus previousAlignerChangeStatus;
    private Compliance previousAlignerCompliance;
    private float previousAlignerAvgWearTimeInSecs;
    private List<AlignerFeedbackDetails> previousAlignerFeedbacks;

    @Nullable
    private List<AlignerPhotoDetails> previousAlignerPhotos;

    @Nullable
    private List<AlignerPhotoDetails> newAlignerPhotos;

    private Boolean validated;

    @Nullable
    private ZonedDateTime validatedAt;

    private Long daysGapFromEndDateToChangeDate;

    @Nullable
    private Long alignerActionId;

    private Long alignerId;

    @JsonCreator
    public AlignerChangeEventEventMetadata(
            Integer previousAlignerNo,
            JawType previousAlignerJawType,
            Integer newAlignerNo,
            JawType newAlignerJawType,
            Long alignerJourneyId,
            LocalDate previousAlignerStartDate,
            LocalDate previousAlignerEndDate,
            LocalDate previousAlignerChangeDate,
            AlignerChangeStatus previousAlignerChangeStatus,
            Compliance previousAlignerCompliance,
            float previousAlignerAvgWearTimeInSecs,
            List<AlignerFeedbackDetails> previousAlignerFeedbacks,
            @Nullable List<AlignerPhotoDetails> previousAlignerPhotos,
            @Nullable List<AlignerPhotoDetails> newAlignerPhotos,
            Boolean validated,
            @Nullable ZonedDateTime validatedAt,
            Long daysGapFromEndDateToChangeDate,
            @Nullable Long alignerActionId,
            Long alignerId) {
        super(EventMetadataType.ALIGNER_CHANGE);
        this.previousAlignerNo = previousAlignerNo;
        this.previousAlignerJawType = previousAlignerJawType;
        this.newAlignerNo = newAlignerNo;
        this.newAlignerJawType = newAlignerJawType;
        this.alignerJourneyId = alignerJourneyId;
        this.previousAlignerStartDate = previousAlignerStartDate;
        this.previousAlignerEndDate = previousAlignerEndDate;
        this.previousAlignerChangeDate = previousAlignerChangeDate;
        this.previousAlignerChangeStatus = previousAlignerChangeStatus;
        this.previousAlignerCompliance = previousAlignerCompliance;
        this.previousAlignerAvgWearTimeInSecs = previousAlignerAvgWearTimeInSecs;
        this.previousAlignerFeedbacks = previousAlignerFeedbacks;
        this.previousAlignerPhotos = previousAlignerPhotos;
        this.newAlignerPhotos = newAlignerPhotos;
        this.validated = validated;
        this.validatedAt = validatedAt;
        this.daysGapFromEndDateToChangeDate = daysGapFromEndDateToChangeDate;
        this.alignerActionId = alignerActionId;
        this.alignerId = alignerId;
    }

    public static AlignerChangeEventEventMetadata from(
            @NonNull Aligner previousAligner,
            @NonNull Aligner newAligner,
            List<AlignerPhoto> previousAlignerPhotos,
            List<AlignerPhoto> newAlignerPhotos,
            AlignerAction action) {

        long daysGap = 0;
        if (previousAligner.getChangeDate() != null && previousAligner.getEndDate() != null) {
            daysGap = ChronoUnit.DAYS.between(previousAligner.getEndDate(), previousAligner.getChangeDate());
        }

        return AlignerChangeEventEventMetadata.builder()
                .previousAlignerNo(previousAligner.getSrNo())
                .previousAlignerJawType(previousAligner.getJawType())
                .previousAlignerCompliance(previousAligner.compliance())
                .previousAlignerStartDate(previousAligner.getStartDate())
                .previousAlignerEndDate(previousAligner.getEndDate())
                .previousAlignerChangeDate(previousAligner.getChangeDate())
                .previousAlignerChangeStatus(previousAligner.alignerChangeStatus())
                .previousAlignerFeedbacks(previousAligner.getFeedbacks().stream()
                        .map(AlignerFeedbackDetails::from)
                        .toList())
                .previousAlignerPhotos(previousAlignerPhotos.stream()
                        .map(AlignerPhotoDetails::from)
                        .toList())
                .previousAlignerAvgWearTimeInSecs(Optional.ofNullable(previousAligner.avgWearTimeInSecs(true, true))
                        .orElse(0f))
                .newAlignerNo(newAligner.getSrNo())
                .newAlignerJawType(newAligner.getJawType())
                .alignerJourneyId(newAligner.getAlignerJourney().getId())
                .newAlignerPhotos(
                        newAlignerPhotos.stream().map(AlignerPhotoDetails::from).toList())
                .validated(false)
                .daysGapFromEndDateToChangeDate(daysGap)
                .alignerActionId(action.getId())
                .alignerId(previousAligner.getId())
                .build();
    }

    public static AlignerChangeEventEventMetadata from(
            @NonNull Aligner previousAligner, @NonNull Aligner newAligner, AlignerAction action) {
        long daysGap = 0;
        if (previousAligner.getChangeDate() != null && previousAligner.getEndDate() != null) {
            daysGap = ChronoUnit.DAYS.between(previousAligner.getEndDate(), previousAligner.getChangeDate());
        }
        return AlignerChangeEventEventMetadata.builder()
                .previousAlignerNo(previousAligner.getSrNo())
                .previousAlignerJawType(previousAligner.getJawType())
                .previousAlignerCompliance(previousAligner.compliance())
                .previousAlignerStartDate(previousAligner.getStartDate())
                .previousAlignerEndDate(previousAligner.getEndDate())
                .previousAlignerChangeDate(previousAligner.getChangeDate())
                .previousAlignerChangeStatus(previousAligner.alignerChangeStatus())
                .previousAlignerFeedbacks(previousAligner.getFeedbacks().stream()
                        .map(AlignerFeedbackDetails::from)
                        .toList())
                .previousAlignerAvgWearTimeInSecs(Optional.ofNullable(previousAligner.avgWearTimeInSecs(true, true))
                        .orElse(0f))
                .newAlignerNo(newAligner.getSrNo())
                .newAlignerJawType(newAligner.getJawType())
                .alignerJourneyId(newAligner.getAlignerJourney().getId())
                .validated(false)
                .daysGapFromEndDateToChangeDate(daysGap)
                .alignerActionId(action.getId())
                .alignerId(previousAligner.getId())
                .build();
    }

    public static AlignerChangeEventEventMetadata forceAlignerChange(
            @NonNull Aligner previousAligner, @NonNull Aligner newAligner, AlignerAction action) {
        long daysGap = 0;
        if (previousAligner.getChangeDate() != null && previousAligner.getEndDate() != null) {
            daysGap = ChronoUnit.DAYS.between(previousAligner.getEndDate(), previousAligner.getChangeDate());
        }
        return AlignerChangeEventEventMetadata.builder()
                .previousAlignerNo(previousAligner.getSrNo())
                .previousAlignerJawType(previousAligner.getJawType())
                .previousAlignerCompliance(previousAligner.compliance())
                .previousAlignerStartDate(previousAligner.getStartDate())
                .previousAlignerEndDate(previousAligner.getEndDate())
                .previousAlignerChangeDate(previousAligner.getChangeDate())
                .previousAlignerChangeStatus(previousAligner.alignerChangeStatus())
                .previousAlignerFeedbacks(previousAligner.getFeedbacks().stream()
                        .map(AlignerFeedbackDetails::from)
                        .toList())
                .previousAlignerAvgWearTimeInSecs(Optional.ofNullable(previousAligner.avgWearTimeInSecs(true, true))
                        .orElse(0f))
                .newAlignerNo(newAligner.getSrNo())
                .newAlignerJawType(newAligner.getJawType())
                .alignerJourneyId(newAligner.getAlignerJourney().getId())
                .validated(false)
                .daysGapFromEndDateToChangeDate(daysGap)
                .alignerActionId(action.getId())
                .alignerId(previousAligner.getId())
                .build();
    }

    public boolean isFeedbackOfAligner(Aligner aligner) {
        return (previousAlignerNo != null
                && aligner != null
                && aligner.getAlignerJourney() != null
                && aligner.getAlignerJourney().getId().equals(alignerJourneyId)
                && aligner.getSrNo() == previousAlignerNo);
    }

    public void updatePreviousAlignerFeedback(Aligner aligner) {
        setPreviousAlignerFeedbacks(aligner.getFeedbacks().stream()
                .map(AlignerFeedbackDetails::from)
                .toList());
    }
}
