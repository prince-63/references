package com.dentalstack.patient.feature.aligner.projection;

public interface AlignerAnalyticsCounts {

    Integer getNeedsAttentionCount();

    Integer getAtRiskCount();

    Integer getOnTrackCount();

    Integer getOnTimeChangesCount();

    Integer getDelayLessThan7DaysCount();

    Integer getDelayMoreThan7DaysCount();

    Integer getPerfectFitCount();

    Integer getSomeIssuesCount();

    Integer getMissingAlignerCount();

    Integer getBrokenAlignerCount();

    Integer getIrritationToGumsCount();

    Integer getSharpEdgesCount();

    Integer getTotalIssuesCount();

    Integer getTotalPatients();

    Integer getTotalAlignerChanges();

    Integer getTotalCheckIns();

    Integer getEarlyChangesCount();

    Integer getDelayedChangesCount();
}
