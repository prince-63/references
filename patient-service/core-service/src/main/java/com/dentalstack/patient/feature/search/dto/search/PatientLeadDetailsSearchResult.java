package com.dentalstack.patient.feature.search.dto.search;

import com.dentalstack.patient.feature.invitation.dto.GlobalSearchLeadResponse;
import com.dentalstack.patient.feature.search.projection.GlobalSearchLeadProjection;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PatientLeadDetailsSearchResult extends GlobalSearchResult {
    private GlobalSearchLeadResponse patient;

    @JsonCreator
    public PatientLeadDetailsSearchResult(@JsonProperty("patient") GlobalSearchLeadProjection projection) {
        super(ResultType.PATIENT_LEAD_DETAILS);
        this.patient = GlobalSearchLeadResponse.from(projection);
    }
}
