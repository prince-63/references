package com.dentalstack.patient.feature.timeline.metadata.event.planningcustomer;

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
public class PlanningCustomerLabUploadedStlFilesMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private String patientName;
    private Long treatmentId;

    @JsonCreator
    public PlanningCustomerLabUploadedStlFilesMetadata(Long patientId, String patientName, Long treatmentId) {
        super(EventMetadataType.PLANNING_CUSTOMER_LAB_UPLOADED_STL_FILES);
        this.patientId = patientId;
        this.patientName = patientName;
        this.treatmentId = treatmentId;
    }
}
