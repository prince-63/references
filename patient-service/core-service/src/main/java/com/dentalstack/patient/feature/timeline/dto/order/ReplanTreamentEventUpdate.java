package com.dentalstack.patient.feature.timeline.dto.order;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.treatement.ReplanTreamentEventMetadata;
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
public class ReplanTreamentEventUpdate extends Update implements Serializable {

    private Long patientId;
    private String practiceName;
    private String orderId;
    private Long treatmentPlanId;

    public static ReplanTreamentEventUpdate from(Event event, Patient patient) {
        var metadata = (ReplanTreamentEventMetadata) event.getMetadata();
        return ReplanTreamentEventUpdate.builder()
                .eventId(event.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .patientId(metadata.getPatientId())
                .practiceName(metadata.getPracticeName())
                .orderId(metadata.getOrderId())
                .treatmentPlanId(metadata.getTreatmentPlanId())
                .build();
    }
}
