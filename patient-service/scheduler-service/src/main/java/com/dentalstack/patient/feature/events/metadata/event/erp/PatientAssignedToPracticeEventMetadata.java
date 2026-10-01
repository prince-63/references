package com.dentalstack.patient.feature.events.metadata.event.erp;

import com.dentalstack.patient.feature.events.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.EventMetadataType;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class PatientAssignedToPracticeEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private String practiceName;
    private String orgName;

    @JsonCreator
    public PatientAssignedToPracticeEventMetadata(Long patientId, String practiceName, String orgName) {
        super(EventMetadataType.PATIENT_ASSIGNED_TO_PRACTICE);
        this.patientId = patientId;
        this.practiceName = practiceName;
        this.orgName = orgName;
    }
}
