package com.dentalstack.patient.feature.patient.projection;

import com.dentalstack.patient.global.enums.language.Language;

public interface LiveActivitySummary {
    Long getId();

    String getEmail();

    Language getLanguage();
}
