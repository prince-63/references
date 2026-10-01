package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class PatientInvitationDeclinedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private PatientDetails patientDetails;
    private Long doctorId;
    private Long patientInvitationId;

    @JsonCreator
    public PatientInvitationDeclinedEventMetadata(
            PatientDetails patientDetails, Long doctorId, Long patientInvitationId) {
        super(EventMetadataType.PATIENT_INVITATION_DECLINED);
        this.patientDetails = patientDetails;
        this.doctorId = doctorId;
        this.patientInvitationId = patientInvitationId;
    }

    public static EventMetadata from(Patient patient, Long doctorId, Long patientInvitationId) {
        return PatientInvitationDeclinedEventMetadata.builder()
                .patientDetails(PatientDetails.from(patient))
                .doctorId(doctorId)
                .patientInvitationId(patientInvitationId)
                .build();
    }
}
