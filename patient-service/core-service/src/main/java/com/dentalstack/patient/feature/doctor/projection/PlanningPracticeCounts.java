package com.dentalstack.patient.feature.doctor.projection;

import java.time.LocalDateTime;

public interface PlanningPracticeCounts {
    Long getActive();

    Long getDraft();

    Long getNeedInfo();

    Long getInProgress();

    Long getInReview();

    Long getInRevision();

    Long getApproved();

    Long getCompleted();

    Long getCasesThisMonth();

    Long getCasesLastMonth();

    LocalDateTime getLastActivityDate();
}
