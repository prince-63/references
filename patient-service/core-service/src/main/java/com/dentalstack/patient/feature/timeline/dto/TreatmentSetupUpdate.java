package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.TreatmentSetupEventMetadata;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
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
public class TreatmentSetupUpdate extends Update implements Serializable {
    private PatientDataFillStatus patientDataFillStatus;

    public static TreatmentSetupUpdate from(Event event, Patient patient) {
        TreatmentSetupEventMetadata metadata = (TreatmentSetupEventMetadata) event.getMetadata();

        return TreatmentSetupUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .patientDataFillStatus(metadata.getPatientDataFillStatus())
                .build();
    }
}
