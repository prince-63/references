package com.dentalstack.patient.feature.aligner.entity.action.metadata;

import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class MoveToPreviousAlignerActionMetadata extends AlignerActionMetadata {

    private long previousAlignerId;
    private long newAlignerId;
    private String moveToPreviousAlignerReason;

    @JsonCreator
    public MoveToPreviousAlignerActionMetadata(
            long previousAlignerId, long newAlignerId, String moveToPreviousAlignerReason) {
        super(AlignerActionType.MOVE_TO_PREVIOUS_ALIGNER);
        this.previousAlignerId = previousAlignerId;
        this.newAlignerId = newAlignerId;
        this.moveToPreviousAlignerReason = moveToPreviousAlignerReason;
    }
}
