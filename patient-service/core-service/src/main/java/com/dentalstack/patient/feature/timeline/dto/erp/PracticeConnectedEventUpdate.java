package com.dentalstack.patient.feature.timeline.dto.erp;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.erp.PracticeConnectedEventMetadata;
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
public class PracticeConnectedEventUpdate extends Update implements Serializable {

    private String practiceName;
    private String doctorName;
    private String doctorRole;

    public static PracticeConnectedEventUpdate from(Event event, Patient patient) {
        var metadata = (PracticeConnectedEventMetadata) event.getMetadata();
        return PracticeConnectedEventUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .practiceName(metadata.getPracticeName())
                .doctorName(metadata.getPracticeName())
                .doctorRole(metadata.getDoctorRole())
                .build();
    }

    public static PracticeConnectedEventUpdate from(Event event) {
        var metadata = (PracticeConnectedEventMetadata) event.getMetadata();
        return PracticeConnectedEventUpdate.builder()
                .eventId(event.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .doctorName(metadata.getPracticeName())
                .active(event.isActive())
                .read(event.isRead())
                .doctorRole(metadata.getDoctorRole())
                .build();
    }
}
