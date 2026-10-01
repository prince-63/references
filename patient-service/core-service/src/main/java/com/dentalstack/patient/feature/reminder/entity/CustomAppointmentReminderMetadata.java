package com.dentalstack.patient.feature.reminder.entity;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import java.time.ZonedDateTime;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CustomAppointmentReminderMetadata extends ReminderMetadata implements Serializable {
    private String name;
    private Long patientId;
    private String notes;
    private PatientDetails patientDetails;
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;
    private String amount;
    private String practiceLocationName;
    private String practiceLocationAddress;
    private String practiceLocationCity;
    private Long practiceLocationId;
    private Boolean isBracesNotesAdded;
    private Long appointmentId;

    @Builder
    @JsonCreator
    public CustomAppointmentReminderMetadata(
            @JsonProperty("name") String name,
            @JsonProperty("patientId") Long patientId,
            @JsonProperty("patientDetails") PatientDetails patientDetails,
            @JsonProperty("notes") String notes,
            @JsonProperty("startDate") ZonedDateTime startDate,
            @JsonProperty("endDate") ZonedDateTime endDate,
            @JsonProperty("amount") String amount,
            @JsonProperty("practiceLocationName") String practiceLocationName,
            @JsonProperty("practiceLocationAddress") String practiceLocationAddress,
            @JsonProperty("practiceLocationCity") String practiceLocationCity,
            @JsonProperty("practiceLocationId") Long practiceLocationId,
            @JsonProperty("isBracesNotesAdded") Boolean isBracesNotesAdded) {
        super(ReminderMetadataType.APPOINTMENT);
        this.name = name;
        this.patientId = patientId;
        this.patientDetails = patientDetails;
        this.notes = notes;
        this.startDate = startDate;
        this.endDate = endDate;
        this.amount = amount;
        this.practiceLocationCity = practiceLocationCity;
        this.practiceLocationName = practiceLocationName;
        this.practiceLocationId = practiceLocationId;
        this.isBracesNotesAdded = isBracesNotesAdded;
        this.practiceLocationAddress = practiceLocationAddress;
    }
}
