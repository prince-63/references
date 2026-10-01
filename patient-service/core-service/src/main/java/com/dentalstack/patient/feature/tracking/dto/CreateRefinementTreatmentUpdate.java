package com.dentalstack.patient.feature.tracking.dto;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.CreateRefinementTreatmentEventMetaData;
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
public class CreateRefinementTreatmentUpdate extends Update implements Serializable {

    private Long patientId;

    public static CreateRefinementTreatmentUpdate from(Event event, Patient patient) {
        var metadata = (CreateRefinementTreatmentEventMetaData) event.getMetadata();
        return CreateRefinementTreatmentUpdate.builder()
                .eventId(event.getId())
                .patientId(metadata.getPatientId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .build();
    }
}
