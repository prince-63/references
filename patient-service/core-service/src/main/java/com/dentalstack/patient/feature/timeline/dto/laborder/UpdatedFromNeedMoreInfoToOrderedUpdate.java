package com.dentalstack.patient.feature.timeline.dto.laborder;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.laborder.UpdatedFromNeedMoreInfoToOrderedMetadata;
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
public class UpdatedFromNeedMoreInfoToOrderedUpdate extends Update implements Serializable {

    private String orderId;

    public static UpdatedFromNeedMoreInfoToOrderedUpdate from(Event event, Patient patient) {
        var metadata = (UpdatedFromNeedMoreInfoToOrderedMetadata) event.getMetadata();
        return UpdatedFromNeedMoreInfoToOrderedUpdate.builder()
                .eventId(event.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .patientId(patient.getId())
                .orderId(metadata.getOrderId())
                .build();
    }
}
