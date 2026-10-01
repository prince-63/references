package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AlignerJourneyFilterRequest {

    private AlignerJourneyFilter alignerJourneyFilter;
    private long doctorId;
    private Long profileId;
    private Long organizationId;

    public enum AlignerJourneyFilter {
        ALIGNER_CHECK_IN_PENDING,
        MISSED_ALIGNER_CHANGE_DATE,
        UPCOMING_ALIGNER_CHANGE,
        POOR_COMPLIANCE,
        GOOD_COMPLIANCE,
        ALL
    }
}
