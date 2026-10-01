package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.AlignerProductionOrderReminderEventMetadata;
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
public class AlignerProductionOrderReminderUpdate extends Update implements Serializable {
    private AlignerJourneyDetails alignerJourney;
    private PatientDetails patient;

    public static Update from(Event event) {
        var metadata = (AlignerProductionOrderReminderEventMetadata) event.getMetadata();
        var patient = metadata.getPatient();

        return AlignerProductionOrderReminderUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .alignerJourney(metadata.getAlignerJourney())
                .patient(patient)
                .build();
    }
}
