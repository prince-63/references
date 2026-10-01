package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import java.time.ZonedDateTime;
import lombok.*;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class CustomAppointmentReminderAddedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private PatientDetails patientDetails;
    private Long appointmentId;
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;
    private String amount;
    private String practiceLocationName;
    private String practiceLocationAddress;

    @JsonCreator
    public CustomAppointmentReminderAddedEventMetadata(
            PatientDetails patientDetails,
            Long appointmentId,
            ZonedDateTime startDate,
            ZonedDateTime endDate,
            String amount,
            String practiceLocationName,
            String practiceLocationAddress) {
        super(EventMetadataType.PATIENT_APPOINTMENT_REMINDER_ADDED);
        this.patientDetails = patientDetails;
        this.appointmentId = appointmentId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.amount = amount;
        this.practiceLocationName = practiceLocationName;
        this.practiceLocationAddress = practiceLocationAddress;
    }
}
