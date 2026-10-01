package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.aligner.enums.aligner.feedback.AlignerIssue;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class AlignerIssueEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long alignerJourneyId;
    private Integer alignerNo;
    private Long patientId;
    private AlignerIssue alignerIssue;
    private String otherIssue;
    private JawType jawType;
    private Long alignerActionId;
    private Long alignerId;

    @JsonCreator
    public AlignerIssueEventMetadata(
            Long alignerJourneyId,
            Integer alignerNo,
            Long patientId,
            AlignerIssue alignerIssue,
            String otherIssue,
            JawType jawType,
            Long alignerActionId,
            Long alignerId) {
        super(EventMetadataType.ISSUE_REPORTED);
        this.alignerJourneyId = alignerJourneyId;
        this.alignerNo = alignerNo;
        this.patientId = patientId;
        this.alignerIssue = alignerIssue;
        this.otherIssue = otherIssue;
        this.jawType = jawType;
        this.alignerActionId = alignerActionId;
        this.alignerId = alignerId;
    }

    public static AlignerIssueEventMetadata from(
            Aligner aligner, Long patientId, AlignerIssue alignerIssue, String otherIssue, AlignerAction action) {
        return AlignerIssueEventMetadata.builder()
                .alignerNo(aligner.getSrNo())
                .alignerJourneyId(aligner.getAlignerJourney().getId())
                .patientId(patientId)
                .alignerIssue(alignerIssue)
                .otherIssue(otherIssue)
                .jawType(aligner.getJawType())
                .alignerActionId(action.getId())
                .alignerId(aligner.getId())
                .build();
    }
}
