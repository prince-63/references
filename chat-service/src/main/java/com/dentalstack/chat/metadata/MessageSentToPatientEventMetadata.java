package com.dentalstack.chat.metadata;

import com.dentalstack.chat.dto.patient.PatientDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class MessageSentToPatientEventMetadata extends EventMetadata {
    private PatientDetails patientDetails;
    private Long doctorId;

    @JsonCreator
    public MessageSentToPatientEventMetadata(PatientDetails patientDetails, Long doctorId) {
        super(EventMetadataType.MESSAGE_SENT_TO_PATIENT);
        this.patientDetails = patientDetails;
        this.doctorId = doctorId;
    }

    public static EventMetadata from(PatientDetails patientDetails, Long doctorId) {
        return MessageSentToPatientEventMetadata.builder()
                .patientDetails(patientDetails)
                .doctorId(doctorId)
                .build();
    }
}
