package com.dentalstack.patient.feature.timeline.metadata.event.vsp.update;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.VspNewMessageLabToCustomerEventMetadata;
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
public class VspNewMessageLabToCustomerEventMetadataUpdate extends Update implements Serializable {
    private Long patientId;
    private String patientName;
    private String orgName;
    private String labName;
    private String practiceName;

    public static VspNewMessageLabToCustomerEventMetadataUpdate from(Event event, Patient patient) {
        VspNewMessageLabToCustomerEventMetadata metadata =
                (VspNewMessageLabToCustomerEventMetadata) event.getMetadata();

        return VspNewMessageLabToCustomerEventMetadataUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .patientName(patient.fullName())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .active(event.isActive())
                .read(event.isRead())
                .orgName(metadata.getOrgName())
                .labName(metadata.getLabName())
                .practiceName(metadata.getPracticeName())
                .build();
    }
}
