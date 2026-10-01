package com.dentalstack.patient.feature.reminder.entity;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProdutionReminderMetadata extends ReminderMetadata implements Serializable {
    private Long doctorId;
    private Long patientId;
    private String notes;
    private PatientDetails patientDetails;
    private long alignerJourneyId;

    @JsonCreator
    public ProdutionReminderMetadata(
            Long patientId, Long doctorId, String notes, PatientDetails patientDetails, long alignerJourneyId) {
        super(ReminderMetadataType.PRODUCTION_ALIGNER_STATUS_PENDING);
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.notes = notes;
        this.patientDetails = patientDetails;
        this.alignerJourneyId = alignerJourneyId;
    }
}
