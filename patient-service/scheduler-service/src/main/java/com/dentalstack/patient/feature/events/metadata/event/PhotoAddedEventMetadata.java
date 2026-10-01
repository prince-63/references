package com.dentalstack.patient.feature.events.metadata.event;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class PhotoAddedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long patientId;
    private String folderPath;

    @JsonCreator
    public PhotoAddedEventMetadata(long patientId, String folderPath) {
        super(EventMetadataType.PHOTO_ADDED_BY_DOCTOR);
        this.patientId = patientId;
        this.folderPath = folderPath;
    }
}
