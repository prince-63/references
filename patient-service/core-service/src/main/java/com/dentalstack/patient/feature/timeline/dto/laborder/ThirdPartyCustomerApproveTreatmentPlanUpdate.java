package com.dentalstack.patient.feature.timeline.dto.laborder;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.laborder.ThirdPartyCustomerApproveTreatmentPlanMetadata;
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
public class ThirdPartyCustomerApproveTreatmentPlanUpdate extends Update implements Serializable {

    private Long patientId;
    private String customerDisplayName;
    private String treatmentPlanName;
    private String orderId;
    private Long treatmentPlanId;

    public static ThirdPartyCustomerApproveTreatmentPlanUpdate from(Event event, Patient patient) {
        var metadata = (ThirdPartyCustomerApproveTreatmentPlanMetadata) event.getMetadata();
        return ThirdPartyCustomerApproveTreatmentPlanUpdate.builder()
                .eventId(event.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .patientId(patient.getId())
                .orderId(metadata.getOrderId())
                .customerDisplayName(metadata.getCustomerDisplayName())
                .treatmentPlanName(metadata.getTreatmentPlanName())
                .treatmentPlanId(metadata.getTreatmentPlanId())
                .build();
    }
}
