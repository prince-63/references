package com.dentalstack.patient.feature.reminder.entity;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentReminderMetadata extends ReminderMetadata implements Serializable {
    private String notes;
    private PatientDetails patientDetails;

    @Builder
    @JsonCreator
    public AppointmentReminderMetadata(
            @JsonProperty("patientDetails") PatientDetails patientDetails, @JsonProperty("notes") String notes) {
        super(ReminderMetadataType.APPOINTMENT_REMINDER);
        this.patientDetails = patientDetails;
        this.notes = notes;
    }
}
