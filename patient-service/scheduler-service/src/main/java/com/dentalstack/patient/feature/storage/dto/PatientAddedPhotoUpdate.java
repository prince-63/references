package com.dentalstack.patient.feature.storage.dto;

import com.dentalstack.patient.feature.events.dto.Update;
import com.dentalstack.patient.feature.events.entity.Event;
import com.dentalstack.patient.feature.events.metadata.event.PatientAddedPhotoEventMetadata;
import com.dentalstack.patient.feature.patient.entity.Patient;
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
public class PatientAddedPhotoUpdate extends Update implements Serializable {
    private Long patientId;
    private String folderPath;

    public static PatientAddedPhotoUpdate from(Event event, Patient patient) {
        var metadata = (PatientAddedPhotoEventMetadata) event.getMetadata();
        return PatientAddedPhotoUpdate.builder()
                .eventId(event.getId())
                .patientId(metadata.getPatientId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .folderPath(metadata.getFolderPath())
                .build();
    }
}
