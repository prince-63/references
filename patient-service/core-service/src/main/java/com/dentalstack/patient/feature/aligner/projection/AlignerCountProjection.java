package com.dentalstack.patient.feature.aligner.projection;

public interface AlignerCountProjection {
    Long getActiveCount();

    Long getRefinementCount();

    Long getPausedCount();

    Long getStartingSoonCount();

    Long getTotalCount();
}
