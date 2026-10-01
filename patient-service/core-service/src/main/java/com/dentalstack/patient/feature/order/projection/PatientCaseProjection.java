package com.dentalstack.patient.feature.order.projection;

import java.time.LocalDate;

public interface PatientCaseProjection {
    Long getPatientId();

    LocalDate getCreatedAt();
}
