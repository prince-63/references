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
public class CustomAppointmentReminderDeletedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private PatientDetails patientDetails;
    private Long appointmentId;
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;
    private String amount;
    private String practiceLocationName;
    private String practiceLocationAddress;

    // Constructor required by your original usage
    @JsonCreator
    public CustomAppointmentReminderDeletedEventMetadata(
            PatientDetails patientDetails,
            Long appointmentId,
            ZonedDateTime startDate,
            ZonedDateTime endDate,
            String amount,
            String practiceLocationName,
            String practiceLocationAddress) {
        super(EventMetadataType.PATIENT_APPOINTMENT_REMINDER_DELETED);
        this.patientDetails = patientDetails;
        this.appointmentId = appointmentId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.amount = amount;
        this.practiceLocationName = practiceLocationName;
        this.practiceLocationAddress = practiceLocationAddress;
    }
}
