package com.dentalstack.patient.feature.events.metadata.event;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.treatment.dto.AlignerJourneyDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AlignerProductionOrderReminderEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AlignerJourneyDetails alignerJourney;
    private PatientDetails patient;

    @JsonCreator
    public AlignerProductionOrderReminderEventMetadata(AlignerJourneyDetails alignerJourney, PatientDetails patient) {
        super(EventMetadataType.ALIGNER_PRODUCTION_ORDER_REMINDER);
        this.alignerJourney = alignerJourney;
        this.patient = patient;
    }
}
