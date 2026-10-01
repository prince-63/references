package com.dentalstack.patient.feature.aligner.projection;

public interface PatientDueStatusCounts {

    Integer getNotAddedCount();

    Integer getOverdueCount();

    Integer getDueTodayCount();

    Integer getDueThisWeekCount();

    Integer getDueLaterCount();

    Integer getNextSevenDaysCount();

    Integer getNextThirtyDaysCount();

    Integer getTotalPatients();
}
