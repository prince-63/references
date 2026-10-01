package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.TreatmentStartingTomorrowEventMetadata;
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
public class TreatmentStartingTomorrowUpdate extends Update implements Serializable {
    private AlignerJourneyDetails alignerJourneyDetails;

    public static TreatmentStartingTomorrowUpdate from(Event event, Patient patient) {
        TreatmentStartingTomorrowEventMetadata metadata = (TreatmentStartingTomorrowEventMetadata) event.getMetadata();

        return TreatmentStartingTomorrowUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .alignerJourneyDetails(metadata.getAlignerJourneyDetails())
                .build();
    }
}
