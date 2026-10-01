package com.dentalstack.patient.feature.aligner.projection;

import com.dentalstack.patient.feature.aligner.entity.action.metadata.AlignerActionMetadata;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import java.time.ZonedDateTime;

public interface AlignerActionDetailsSummary {
    Long getAlignerActionId();

    ZonedDateTime getPerformedAt();

    String getFirstName();

    String getLastName();

    String getProfilePictureUrl();

    AlignerActionMetadata getMetadata();

    JawType getJawType();

    Integer getAlignerNumber();

    String getPerformedBy();

    Long getPatientId();

    Long getAlignerJourneyId();
}
