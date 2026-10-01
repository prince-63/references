package com.dentalstack.patient.feature.search.dto.search;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class PatientDetailsSearchResult extends GlobalSearchResult {
    private PatientDetails patient;

    @JsonCreator
    public PatientDetailsSearchResult(PatientDetails patient) {
        super(ResultType.PATIENT_DETAILS);
        this.patient = patient;
    }
}
