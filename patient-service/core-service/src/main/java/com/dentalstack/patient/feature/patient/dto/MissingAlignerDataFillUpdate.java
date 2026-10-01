package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.MissingAlignerDataFillEventMetadata;
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
public class MissingAlignerDataFillUpdate extends Update implements Serializable {
    private PatientDetails PatientDetails;

    public static MissingAlignerDataFillUpdate from(Event event, Patient patient) {
        var metadata = (MissingAlignerDataFillEventMetadata) event.getMetadata();
        return MissingAlignerDataFillUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .PatientDetails(metadata.getPatientDetails())
                .build();
    }
}
