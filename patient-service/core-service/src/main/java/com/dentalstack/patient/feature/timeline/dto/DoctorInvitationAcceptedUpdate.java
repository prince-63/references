package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.doctorinvitation.DoctorInvitationAcceptedEventMetadata;
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
public class DoctorInvitationAcceptedUpdate extends Update implements Serializable {
    private PatientDetails patientDetails;
    private Long doctorId;

    public static Update from(Event event) {
        DoctorInvitationAcceptedEventMetadata metadata = (DoctorInvitationAcceptedEventMetadata) event.getMetadata();
        var patient = metadata.getPatientDetails();

        return DoctorInvitationAcceptedUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .patientDetails(patient)
                .doctorId(metadata.getDoctorId())
                .build();
    }
}
