package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.global.dto.notes.NotesDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@JsonTypeName("ADD_NOTES")
public class AddNotesEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private NotesDetails notesDetails;

    @JsonCreator
    public AddNotesEventMetadata(NotesDetails notesDetails) {
        super(EventMetadataType.ADD_NOTES);
        this.notesDetails = notesDetails;
    }
}
