package com.dentalstack.patient.feature.search.dto.search;

import com.dentalstack.patient.feature.doctor.dto.PracticeLocationDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class PracticeLocationSearchResult extends GlobalSearchResult {
    private PracticeLocationDetails practiceLocationDetails;

    @JsonCreator
    public PracticeLocationSearchResult(PracticeLocationDetails practiceLocationDetails) {
        super(ResultType.DOCTOR_PRACTICE_LOCATION);
        this.practiceLocationDetails = practiceLocationDetails;
    }
}
