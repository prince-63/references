package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.TreatmentStartingEventMetadata;
import java.io.Serializable;
import java.time.LocalDate;
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
public class TreatmentStartingUpdate extends Update implements Serializable {
    private AlignerJourneyDetails alignerJourneyDetails;

    public static TreatmentStartingUpdate from(Event event, Patient patient) {
        var metadata = (TreatmentStartingEventMetadata) event.getMetadata();
        AlignerJourneyDetails journeyDetails = metadata.getAlignerJourneyDetails();

        LocalDate startDate = journeyDetails.getFirstAlignerStartDate();

        if (startDate == null) {
            return null;
        }

        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        if (!startDate.equals(today) && !startDate.equals(tomorrow)) {
            return null;
        }

        return TreatmentStartingUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .alignerJourneyDetails(journeyDetails)
                .build();
    }
}
