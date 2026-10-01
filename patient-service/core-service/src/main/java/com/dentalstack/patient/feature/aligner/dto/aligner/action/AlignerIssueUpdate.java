package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.aligner.enums.aligner.feedback.AlignerIssue;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.AlignerIssueEventMetadata;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AlignerIssueUpdate extends Update implements Serializable {

    private Long alignerJourneyId;
    private Integer alignerNo;

    private Long patientId;
    private AlignerIssue alignerIssue;
    private String otherIssue;
    private Long alignerActionId;
    private Long alignerId;

    public static AlignerIssueUpdate from(Event event, Patient patient) {
        var metadata = (AlignerIssueEventMetadata) event.getMetadata();
        return AlignerIssueUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .alignerNo(metadata.getAlignerNo())
                .patientId(metadata.getPatientId())
                .alignerJourneyId(metadata.getAlignerJourneyId())
                .alignerIssue(metadata.getAlignerIssue())
                .otherIssue(metadata.getOtherIssue())
                .alignerActionId(metadata.getAlignerActionId())
                .alignerId(metadata.getAlignerId())
                .build();
    }
}
