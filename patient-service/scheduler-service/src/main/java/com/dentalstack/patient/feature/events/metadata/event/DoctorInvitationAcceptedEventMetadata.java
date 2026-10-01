package com.dentalstack.patient.feature.events.metadata.event;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class DoctorInvitationAcceptedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private PatientDetails patientDetails;
    private Long doctorId;
    private Long doctorInvitationId;

    @JsonCreator
    public DoctorInvitationAcceptedEventMetadata(
            PatientDetails patientDetails, Long doctorId, Long doctorInvitationId) {
        super(EventMetadataType.DOCTOR_INVITATION_ACCEPTED);
        this.patientDetails = patientDetails;
        this.doctorId = doctorId;
        this.doctorInvitationId = doctorInvitationId;
    }
}
