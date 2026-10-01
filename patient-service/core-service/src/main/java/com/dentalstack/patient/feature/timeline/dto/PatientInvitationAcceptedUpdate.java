package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.PatientInvitationAcceptedEventMetadata;
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
public class PatientInvitationAcceptedUpdate extends Update implements Serializable {
    private PatientDetails patientDetails;
    private Long doctorId;
    private Long alignerJourneyId;

    public static PatientInvitationAcceptedUpdate from(Event event, long alignerJourneyId) {
        PatientInvitationAcceptedEventMetadata metadata = (PatientInvitationAcceptedEventMetadata) event.getMetadata();
        var patient = metadata.getPatientDetails();

        return PatientInvitationAcceptedUpdate.builder()
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
                .alignerJourneyId(alignerJourneyId)
                .build();
    }
}
