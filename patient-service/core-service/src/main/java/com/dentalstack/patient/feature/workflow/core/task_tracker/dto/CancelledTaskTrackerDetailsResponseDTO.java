package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.workflow.core.task_tracker.projection.CancelledPatientTaskTrackerProjection;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelledTaskTrackerDetailsResponseDTO {
    private Long id;
    private Long patientId;
    private String patientUuid;
    private String patientName;
    private String clinicName;
    private String createdBy;
    private LocalDateTime createdOn;
    private InvitationStatus invitationStatus;

    public static CancelledTaskTrackerDetailsResponseDTO from(CancelledPatientTaskTrackerProjection projection) {
        if (projection == null) return null;
        return CancelledTaskTrackerDetailsResponseDTO.builder()
                .id(projection.getId())
                .patientId(projection.getPatientId())
                .patientUuid(projection.getPatientUuid())
                .patientName(projection.getPatientName())
                .clinicName(projection.getClinicName())
                .createdBy(projection.getCreatedBy())
                .createdOn(projection.getCreatedOn())
                .invitationStatus(projection.getMappedInvitationStatus())
                .build();
    }
}
