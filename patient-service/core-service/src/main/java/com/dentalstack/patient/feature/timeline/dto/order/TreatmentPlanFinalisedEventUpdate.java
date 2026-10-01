package com.dentalstack.patient.feature.timeline.dto.order;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.treatement.TreatmentPlanFinalisedEventMetadata;
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
public class TreatmentPlanFinalisedEventUpdate extends Update implements Serializable {

    private Long patientId;
    private String practiceName;
    private String orderId;
    private Long treatmentPlanId;

    public static TreatmentPlanFinalisedEventUpdate from(Event event, Patient patient) {
        var metadata = (TreatmentPlanFinalisedEventMetadata) event.getMetadata();
        return TreatmentPlanFinalisedEventUpdate.builder()
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
