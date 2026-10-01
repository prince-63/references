package com.dentalstack.patient.feature.reminder.entity;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class GeneralReminderMetadata extends ReminderMetadata implements Serializable {
    private String notes;
    private Long patientId;
    private PatientDetails patientDetails;

    @JsonCreator
    public GeneralReminderMetadata(
            @JsonProperty("note") String note,
            @JsonProperty("patientId") Long patientId,
            @JsonProperty("patientDetails") PatientDetails patientDetails) {
        super(ReminderMetadataType.GENERAL_REMINDER);
        this.notes = note;
        this.patientId = patientId;
        this.patientDetails = patientDetails;
    }
}
