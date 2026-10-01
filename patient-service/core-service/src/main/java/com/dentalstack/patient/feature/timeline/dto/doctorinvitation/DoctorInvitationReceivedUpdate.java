package com.dentalstack.patient.feature.timeline.dto.doctorinvitation;

import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.doctorinvitation.DoctorInvitationReceivedEventMetadata;
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
public class DoctorInvitationReceivedUpdate extends Update implements Serializable {

    private String practiceName;
    private Long patientId;
    private String orgName;
    private String doctorRole;

    public static DoctorInvitationReceivedUpdate from(Event event) {
        var metadata = (DoctorInvitationReceivedEventMetadata) event.getMetadata();
        return DoctorInvitationReceivedUpdate.builder()
                .eventId(event.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .active(event.isActive())
                .read(event.isRead())
                .practiceName(metadata.getPracticeName())
                .orgName(metadata.getOrgName())
                .doctorRole(metadata.getDoctorRole())
                .build();
    }
}
