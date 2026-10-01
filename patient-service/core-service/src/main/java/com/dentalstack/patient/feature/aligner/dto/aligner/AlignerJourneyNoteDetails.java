package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.AlignerJourneyNote;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.io.Serializable;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlignerJourneyNoteDetails implements Serializable {
    private long id;
    private String title;
    private String text;
    private long addedBy;
    private UserType addedByUserType;
    private ZonedDateTime createdAt;

    public static AlignerJourneyNoteDetails from(AlignerJourneyNote alignerJourneyNote) {
        return new AlignerJourneyNoteDetails(
                alignerJourneyNote.getId(),
                alignerJourneyNote.getTitle(),
                alignerJourneyNote.getText(),
                alignerJourneyNote.getAddedBy(),
                alignerJourneyNote.getAddedByUserType(),
                alignerJourneyNote.getCreatedAt());
    }
}
