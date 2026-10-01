package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.aligner.dto.alignertreatment.AlignerTreatmentResponse;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class TreatmentPlanAddedEventMetaData extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AlignerTreatmentResponse alignerTreatmentResponse;
    private String patientType;
    private Boolean hasReadExistingPatientForm;

    @JsonCreator
    public TreatmentPlanAddedEventMetaData(
            AlignerTreatmentResponse alignerTreatmentResponse, String patientType, Boolean hasReadExistingPatientForm) {
        super(EventMetadataType.TREATMENT_PLAN_ADDED);
        this.alignerTreatmentResponse = alignerTreatmentResponse;
        this.patientType = patientType;
        this.hasReadExistingPatientForm = hasReadExistingPatientForm;
    }
}
