package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.treatment.dto.TreatmentCompleted;
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
public class TreatmentCompletedMetadataUpdate extends Update implements Serializable {
    private TreatmentCompleted treatmentCompleted;

    public static TreatmentCompletedMetadataUpdate from(Event event, Patient patient) {
        TreatmentCompletedEventMetadata metadata = (TreatmentCompletedEventMetadata) event.getMetadata();

        return TreatmentCompletedMetadataUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .treatmentCompleted(metadata.getTreatmentCompleted())
                .build();
    }
}
