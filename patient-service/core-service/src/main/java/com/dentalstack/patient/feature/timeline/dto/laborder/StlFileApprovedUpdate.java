package com.dentalstack.patient.feature.timeline.dto.laborder;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.laborder.StlFileApprovedMetadata;
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
public class StlFileApprovedUpdate extends Update implements Serializable {

    private String labAdminDisplayName;
    private String orderId;
    private Long patientId;

    public static StlFileApprovedUpdate from(Event event, Patient patient) {
        var metadata = (StlFileApprovedMetadata) event.getMetadata();
        return StlFileApprovedUpdate.builder()
                .eventId(event.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .patientId(patient.getId())
                .orderId(metadata.getOrderId())
                .labAdminDisplayName(metadata.getLabAdminDisplayName())
                .build();
    }
}
