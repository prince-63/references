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
public class MessageSentToPatientEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private PatientDetails patientDetails;
    private Long doctorId;

    @JsonCreator
    public MessageSentToPatientEventMetadata(PatientDetails patientDetails, Long doctorId) {
        super(EventMetadataType.MESSAGE_SENT_TO_PATIENT);
        this.patientDetails = patientDetails;
        this.doctorId = doctorId;
    }

    public static EventMetadata from(Patient patient, Long doctorId) {
        return MessageSentToPatientEventMetadata.builder()
                .patientDetails(PatientDetails.from(patient))
                .doctorId(doctorId)
                .build();
    }
}
