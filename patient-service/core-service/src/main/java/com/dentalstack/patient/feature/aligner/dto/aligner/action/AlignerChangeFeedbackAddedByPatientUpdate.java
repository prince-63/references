package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AlignerFeedbackDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.AlignerChangeFeedbackAddedByPatientEventMetadata;
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
public class AlignerChangeFeedbackAddedByPatientUpdate extends Update implements Serializable {
    private AlignerDetails alignerDetails;
    private AlignerFeedbackDetails alignerFeedbackDetails;

    private Long patientId;

    public static AlignerChangeFeedbackAddedByPatientUpdate from(Event event, Patient patient) {
        var metadata = (AlignerChangeFeedbackAddedByPatientEventMetadata) event.getMetadata();
        return AlignerChangeFeedbackAddedByPatientUpdate.builder()
                .eventId(event.getId())
                .eventType(event.getType())
                .patientId(patient.getId())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .alignerDetails(metadata.getAlignerDetails())
                .alignerFeedbackDetails(metadata.getAlignerFeedbackDetails())
                .build();
    }
}
