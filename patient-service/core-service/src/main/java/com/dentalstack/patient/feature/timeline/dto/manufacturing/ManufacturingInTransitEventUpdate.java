package com.dentalstack.patient.feature.timeline.dto.manufacturing;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.manufacturing.ManufacturingInTransitEventMetadata;
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
public class ManufacturingInTransitEventUpdate extends Update implements Serializable {
    private Long patientId;
    private String orderId;
    private Long treatmentPlanId;
    private String patientType;
    private Boolean hasReadExistingPatientForm;

    public static ManufacturingInTransitEventUpdate from(Event event, Patient patient) {
        var metadata = (ManufacturingInTransitEventMetadata) event.getMetadata();
        return ManufacturingInTransitEventUpdate.builder()
                .eventId(event.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .patientId(metadata.getPatientId())
                .orderId(metadata.getOrderId())
                .treatmentPlanId(metadata.getTreatmentPlanId())
                .patientType(metadata.getPatientType())
                .hasReadExistingPatientForm(patient.getHasReadExistingPatientForm())
                .build();
    }
}
