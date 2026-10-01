package com.dentalstack.patient.feature.timeline.dto.order;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.order.OrderOnHoldEventMetadata;
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
public class OrderOnHoldEventUpdate extends Update implements Serializable {

    private Long patientId;
    private String practiceName;
    private String orderId;

    public static OrderOnHoldEventUpdate from(Event event, Patient patient) {
        var metadata = (OrderOnHoldEventMetadata) event.getMetadata();
        return OrderOnHoldEventUpdate.builder()
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
                .build();
    }
}
