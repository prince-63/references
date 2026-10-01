package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AlignerFeedbackDetails;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
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
public class ManualAlignerChangeEventEventMetadata extends EventMetadata implements Serializable {

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

    private Boolean validated;

    @Nullable
    private ZonedDateTime validatedAt;

    private Long daysGapFromEndDateToChangeDate;

    @Nullable
    private Long alignerActionId;

    @Nullable
    private List<AlignerPhotoDetails> previousAlignerPhotos;

    @Nullable
    private List<AlignerPhotoDetails> newAlignerPhotos;

    private Long alignerId;

    @JsonCreator
    public ManualAlignerChangeEventEventMetadata(
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
            Boolean validated,
            @Nullable ZonedDateTime validatedAt,
            Long daysGapFromEndDateToChangeDate,
            @Nullable Long alignerActionId,
            @Nullable List<AlignerPhotoDetails> previousAlignerPhotos,
            @Nullable List<AlignerPhotoDetails> newAlignerPhotos,
            Long alignerId) {
        super(EventMetadataType.MANUAL_ALIGNER_CHANGE);
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
        this.validated = validated;
        this.validatedAt = validatedAt;
        this.daysGapFromEndDateToChangeDate = daysGapFromEndDateToChangeDate;
        this.alignerActionId = alignerActionId;
        this.previousAlignerPhotos = previousAlignerPhotos;
        this.newAlignerPhotos = newAlignerPhotos;
        this.alignerId = alignerId;
    }

    public static ManualAlignerChangeEventEventMetadata from(
            @NonNull Aligner previousAligner, @NonNull Aligner newAligner, AlignerAction action) {
        long daysGap = 0;
        if (previousAligner.getChangeDate() != null && previousAligner.getEndDate() != null) {
            daysGap = ChronoUnit.DAYS.between(previousAligner.getEndDate(), previousAligner.getChangeDate());
        }
        return ManualAlignerChangeEventEventMetadata.builder()
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
                .previousAlignerPhotos(previousAligner.getPhotos().stream()
                        .map(AlignerPhotoDetails::from)
                        .toList())
                .newAlignerPhotos(newAligner.getPhotos().stream()
                        .map(AlignerPhotoDetails::from)
                        .toList())
                .alignerId(previousAligner.getId())
                .build();
    }
}
