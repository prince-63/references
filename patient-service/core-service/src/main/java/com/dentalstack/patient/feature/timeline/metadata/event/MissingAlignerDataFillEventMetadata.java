package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
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
public class MissingAlignerDataFillEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private PatientDetails patientDetails;

    @JsonCreator
    public MissingAlignerDataFillEventMetadata(PatientDetails patientDetails) {
        super(EventMetadataType.PATIENT_FILLED_MISSING_DATA);
        this.patientDetails = patientDetails;
    }
}
