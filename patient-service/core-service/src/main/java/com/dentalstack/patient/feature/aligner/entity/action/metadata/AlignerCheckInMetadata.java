package com.dentalstack.patient.feature.aligner.entity.action.metadata;

import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class AlignerCheckInMetadata extends AlignerActionMetadata {
    private long alignerId;
    private List<Long> alignerPhotoIds;
    private List<Long> alignerFeedbackIds;

    @JsonCreator
    public AlignerCheckInMetadata(long alignerId, List<Long> alignerPhotoIds, List<Long> alignerFeedbackIds) {
        super(AlignerActionType.CHECK_IN);
        this.alignerId = alignerId;
        this.alignerPhotoIds = alignerPhotoIds;
        this.alignerFeedbackIds = alignerFeedbackIds;
    }
}
