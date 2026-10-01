package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AlignerFeedbackDetails;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerFeedback;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class AlignerChangeFeedbackAddedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AlignerJourneyDetails alignerJourneyDetails;
    private AlignerDetails alignerDetails;
    private AlignerFeedbackDetails alignerFeedbackDetails;
    private Long alignerActionId;
    private Long alignerJourneyId;
    private Long alignerId;

    @JsonCreator
    public AlignerChangeFeedbackAddedEventMetadata(
            AlignerJourneyDetails alignerJourneyDetails,
            AlignerDetails alignerDetails,
            AlignerFeedbackDetails alignerFeedbackDetails,
            Long alignerActionId,
            Long alignerJourneyId,
            Long alignerId) {
        super(EventMetadataType.ALIGNER_CHANGE_FEEDBACK_ADDED);
        this.alignerJourneyDetails = alignerJourneyDetails;
        this.alignerDetails = alignerDetails;
        this.alignerFeedbackDetails = alignerFeedbackDetails;
        this.alignerActionId = alignerActionId;
        this.alignerJourneyId = alignerJourneyId;
        this.alignerId = alignerId;
    }

    public static AlignerChangeFeedbackAddedEventMetadata from(
            AlignerJourney alignerJourney, Aligner aligner, AlignerFeedback alignerFeedback, long alignerActionId) {

        return new AlignerChangeFeedbackAddedEventMetadata(
                AlignerJourneyDetails.from(alignerJourney),
                AlignerDetails.from(aligner),
                AlignerFeedbackDetails.from(alignerFeedback),
                alignerActionId,
                alignerJourney.getId(),
                aligner.getId());
    }

    public static AlignerChangeFeedbackAddedEventMetadata from(
            AlignerJourney alignerJourney, Aligner aligner, AlignerFeedback alignerFeedback) {

        return new AlignerChangeFeedbackAddedEventMetadata(
                AlignerJourneyDetails.from(alignerJourney),
                AlignerDetails.from(aligner),
                AlignerFeedbackDetails.from(alignerFeedback),
                null,
                alignerJourney.getId(),
                aligner.getId());
    }
}
