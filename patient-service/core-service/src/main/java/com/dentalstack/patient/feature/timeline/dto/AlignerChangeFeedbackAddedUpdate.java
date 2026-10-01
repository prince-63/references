package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AlignerFeedbackDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.AlignerChangeFeedbackAddedEventMetadata;
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
public class AlignerChangeFeedbackAddedUpdate extends Update implements Serializable {
    private AlignerJourneyDetails alignerJourneyDetails;
    private AlignerDetails alignerDetails;
    private AlignerFeedbackDetails alignerFeedbackDetails;
    private Long alignerActionId;
    private Long alignerJourneyId;
    private Long alignerId;

    public static AlignerChangeFeedbackAddedUpdate from(Event event, Patient patient) {
        var metadata = (AlignerChangeFeedbackAddedEventMetadata) event.getMetadata();

        return AlignerChangeFeedbackAddedUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isActive())
                .alignerJourneyDetails(metadata.getAlignerJourneyDetails())
                .alignerDetails(metadata.getAlignerDetails())
                .alignerFeedbackDetails(metadata.getAlignerFeedbackDetails())
                .alignerActionId(metadata.getAlignerActionId())
                .alignerJourneyId(metadata.getAlignerJourneyId())
                .alignerId(metadata.getAlignerId())
                .build();
    }
}
