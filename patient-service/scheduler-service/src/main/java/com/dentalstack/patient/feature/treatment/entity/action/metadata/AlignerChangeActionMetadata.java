package com.dentalstack.patient.feature.treatment.entity.action.metadata;

import com.dentalstack.patient.feature.treatment.entity.action.AlignerActionType;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class AlignerChangeActionMetadata extends AlignerActionMetadata {

    private long previousAlignerId;
    private long newAlignerId;
    private List<Long> previousAlignerPhotoIds;
    private List<Long> newAlignerPhotoIds;
    private List<Long> previousAlignerFeedbackIds;
    private LocalDate changeDate;
    private LocalDate alignerEndDate;
    private LocalDate alignerStartDate;

    @JsonCreator
    public AlignerChangeActionMetadata(
            long previousAlignerId,
            long newAlignerId,
            List<Long> previousAlignerPhotoIds,
            List<Long> newAlignerPhotoIds,
            List<Long> previousAlignerFeedbackIds,
            LocalDate changeDate,
            LocalDate alignerEndDate,
            LocalDate alignerStartDate) {
        super(AlignerActionType.ALIGNER_CHANGE);
        this.previousAlignerId = previousAlignerId;
        this.newAlignerId = newAlignerId;
        this.previousAlignerPhotoIds = previousAlignerPhotoIds;
        this.newAlignerPhotoIds = newAlignerPhotoIds;
        this.previousAlignerFeedbackIds = previousAlignerFeedbackIds;
        this.changeDate = changeDate;
        this.alignerEndDate = alignerEndDate;
        this.alignerStartDate = alignerStartDate;
    }
}
