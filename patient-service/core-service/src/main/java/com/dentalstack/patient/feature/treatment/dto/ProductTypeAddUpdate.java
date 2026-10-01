package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.ProductTypeAddedEventMetaData;
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
public class ProductTypeAddUpdate extends Update implements Serializable {

    private PatientDetails patientDetails;

    public static ProductTypeAddUpdate from(Event event, Patient patient) {
        var metadata = (ProductTypeAddedEventMetaData) event.getMetadata();
        return ProductTypeAddUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .patientDetails(metadata.getPatientDetails())
                .build();
    }
}
