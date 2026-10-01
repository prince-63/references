package com.dentalstack.patient.feature.events.metadata;

import com.dentalstack.patient.feature.events.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.EventMetadataType;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
import com.dentalstack.patient.feature.treatment.dto.AlignerJourneyDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class RefinementTreatmentEventMetaData extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AlignerJourneyDetails alignerJourneyDetails;
    private PatientDataFillStatus patientDataFillStatus;

    @Builder
    @JsonCreator
    public RefinementTreatmentEventMetaData(
            AlignerJourneyDetails alignerJourneyDetails, PatientDataFillStatus patientDataFillStatus) {
        super(EventMetadataType.REFINEMENT_TREATMENT);
        this.alignerJourneyDetails = alignerJourneyDetails;
        this.patientDataFillStatus = patientDataFillStatus;
    }
}
