package com.dentalstack.patient.feature.timeline.dto.erp;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.erp.PatientAddedByPracticeEventMetadata;
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
public class PatientAddedByPracticeEventUpdate extends Update implements Serializable {

    private String practiceName;
    private Long patientId;

    public static PatientAddedByPracticeEventUpdate from(Event event, Patient patient) {
        var metadata = (PatientAddedByPracticeEventMetadata) event.getMetadata();
        return PatientAddedByPracticeEventUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .practiceName(metadata.getPracticeName())
                .patientId(patient.getId())
                .build();
    }
}
