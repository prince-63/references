package com.dentalstack.patient.feature.timeline.dto.order;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.order.NewOrderAddedEventMetadata;
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
public class NewOrderAddedEventUpdate extends Update implements Serializable {

    private Long patientId;
    private String orderId;
    private String practiceName;

    public static NewOrderAddedEventUpdate from(Event event, Patient patient) {
        var metadata = (NewOrderAddedEventMetadata) event.getMetadata();
        return NewOrderAddedEventUpdate.builder()
                .eventId(event.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .patientId(metadata.getPatientId())
                .orderId(metadata.getOrderId())
                .practiceName(metadata.getPracticeName())
                .build();
    }
}
