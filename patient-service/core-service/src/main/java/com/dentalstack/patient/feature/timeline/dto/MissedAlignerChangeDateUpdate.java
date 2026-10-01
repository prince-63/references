package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.MissedAlignerChangeDateEventMetadata;
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
public class MissedAlignerChangeDateUpdate extends Update implements Serializable {
    private Integer nextAlignerNo;
    private PatientDetails patientDetails;
    private Integer delayedDays;

    public static MissedAlignerChangeDateUpdate from(Event event, Patient patient) {
        MissedAlignerChangeDateEventMetadata metadata = (MissedAlignerChangeDateEventMetadata) event.getMetadata();

        return MissedAlignerChangeDateUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .nextAlignerNo(metadata.getNextAlignerNo())
                .patientDetails(metadata.getPatientDetails())
                .delayedDays(metadata.getDelayedDays())
                .build();
    }
}
