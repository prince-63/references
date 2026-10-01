package com.dentalstack.patient.feature.timeline.metadata.event.erp;

import com.dentalstack.patient.feature.timeline.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.EventMetadataType;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class PatientAddedByPracticeEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private String practiceName;

    @JsonCreator
    public PatientAddedByPracticeEventMetadata(Long patientId, String practiceName) {
        super(EventMetadataType.PATIENT_ADDED_BY_PRACTICE);
        this.patientId = patientId;
        this.practiceName = practiceName;
    }
}
