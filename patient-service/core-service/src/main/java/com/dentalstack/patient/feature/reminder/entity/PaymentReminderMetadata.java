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
public class PaymentReminderMetadata extends ReminderMetadata implements Serializable {
    private String notes;
    private Float amount;
    private Long patientId;
    private PatientDetails patientDetails;

    @JsonCreator
    public PaymentReminderMetadata(
            @JsonProperty("note") String note,
            @JsonProperty("amount") Float amount,
            Long patientId,
            PatientDetails patientDetails) {
        super(ReminderMetadataType.PAYMENTS_PENDING);
        this.notes = note;
        this.amount = amount;
        this.patientId = patientId;
        this.patientDetails = patientDetails;
    }
}
