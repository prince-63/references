package com.dentalstack.patient.feature.aligner.projection;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface AlignerChangeDetailsSummary {
    Long getAlignerId();

    Long getActionId();

    LocalDate getChangeDate();

    JawType getCurrentJawType();

    Integer getCurrentAlignerNumber();

    Integer getDaysDelay();

    String getCheckInPerformed();

    String getManual();

    Long getPatientId();

    Long getAlignerJourneyId();

    String getFirstName();

    String getLastName();

    String getProfileUrl();

    JawType getPreviousJawType();

    Integer getPreviousAlignerNumber();

    LocalDate getEndDate();

    Long getPreviousAlignerId();

    Long getAlignerIdInTheActionTable();

    LocalDateTime getPerformedAt();
}
