package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.RefinementTreatmentEventMetaData;
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
public class RefinementTreatmentUpdate extends Update implements Serializable {

    private AlignerJourneyDetails alignerJourneyDetails;

    public static RefinementTreatmentUpdate from(Event event, Patient patient) {
        var metadata = (RefinementTreatmentEventMetaData) event.getMetadata();
        return RefinementTreatmentUpdate.builder()
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
