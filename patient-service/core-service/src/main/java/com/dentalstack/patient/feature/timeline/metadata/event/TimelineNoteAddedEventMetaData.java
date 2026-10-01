package com.dentalstack.patient.feature.timeline.metadata.event;

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
public class TimelineNoteAddedEventMetaData extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long doctorId;

    private long patientId;

    private String note;

    private String title;

    @JsonCreator
    public TimelineNoteAddedEventMetaData(long doctorId, long patientId, String note, String title) {
        super(EventMetadataType.TIMELINE_NOTE_ADDED);
        this.note = note;
        this.title = title;
        this.patientId = patientId;
        this.doctorId = doctorId;
    }
}
