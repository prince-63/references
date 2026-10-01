package com.dentalstack.patient.feature.timeline.metadata.event.vsp;

import com.dentalstack.patient.feature.timeline.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.EventMetadataType;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class VspRevisionRequestedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private String patientName;
    private String treatmentName;
    private String version;
    private Long treatmentId;
    private String labName;
    private String practiceName;

    @JsonCreator
    public VspRevisionRequestedEventMetadata(
            Long patientId,
            String patientName,
            Long treatmentId,
            String treatmentName,
            String version,
            String labName,
            String practiceName) {
        super(EventMetadataType.VSP_REVISION_REQUESTED);
        this.patientId = patientId;
        this.patientName = patientName;
        this.treatmentId = treatmentId;
        this.treatmentName = treatmentName;
        this.version = version;
        this.labName = labName;
        this.practiceName = practiceName;
    }
}
