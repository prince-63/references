package com.dentalstack.patient.feature.events.metadata.event;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import java.time.ZonedDateTime;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class AppointmentEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private PatientDetails patientDetails;
    private Long appointmentId;
    private ZonedDateTime appointmentAt;

    @JsonCreator
    public AppointmentEventMetadata(PatientDetails patientDetails, Long appointmentId, ZonedDateTime appointmentAt) {
        super(EventMetadataType.PATIENT_APPOINTMENT_ADDED);
        this.patientDetails = patientDetails;
        this.appointmentId = appointmentId;
        this.appointmentAt = appointmentAt;
    }
}
