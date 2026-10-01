package com.dentalstack.patient.feature.aligner.projection;

public interface AlignerActionCounts {
    Integer getAlignerChangesCompleted();

    Integer getAlignerCheckInMade();

    Integer getReportedIssues();

    Integer getTotalActions();
}
