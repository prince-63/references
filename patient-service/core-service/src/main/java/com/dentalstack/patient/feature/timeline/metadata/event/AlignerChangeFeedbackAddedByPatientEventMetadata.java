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
public class AlignerChangeFeedbackAddedByPatientEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AlignerJourneyDetails alignerJourneyDetails;
    private AlignerDetails alignerDetails;
    private AlignerFeedbackDetails alignerFeedbackDetails;
    private Long alignerActionId;

    @JsonCreator
    public AlignerChangeFeedbackAddedByPatientEventMetadata(
            AlignerJourneyDetails alignerJourneyDetails,
            AlignerDetails alignerDetails,
            AlignerFeedbackDetails alignerFeedbackDetails,
            long alignerActionId) {
        super(EventMetadataType.ALIGNER_CHANGE_FEEDBACK_ADDED_BY_DOCTOR);
        this.alignerJourneyDetails = alignerJourneyDetails;
        this.alignerDetails = alignerDetails;
        this.alignerFeedbackDetails = alignerFeedbackDetails;
        this.alignerActionId = alignerActionId;
    }

    public static AlignerChangeFeedbackAddedByPatientEventMetadata from(
            AlignerJourney alignerJourney, Aligner aligner, AlignerFeedback alignerFeedback, long actionId) {

        return new AlignerChangeFeedbackAddedByPatientEventMetadata(
                AlignerJourneyDetails.from(alignerJourney),
                AlignerDetails.from(aligner),
                AlignerFeedbackDetails.from(alignerFeedback),
                actionId);
    }
}
