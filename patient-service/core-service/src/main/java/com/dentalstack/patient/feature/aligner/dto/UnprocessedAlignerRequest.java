package com.dentalstack.patient.feature.aligner.dto;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UnprocessedAlignerRequest {

    private Long profileId;
    private Long doctorId;
    private Long organizationId;
    private Long customerId;
    private String searchTerm;

    private DueByFilter dueByFilter;

    @Builder.Default
    private SortOption sortOption = SortOption.NEWEST_TO_OLDEST;

    @Builder.Default
    private Integer page = 0;

    @Builder.Default
    private Integer size = 10;

    private List<DoctorRole> roles;
    private UnprocessedAlignerResponse.CaseType caseType;

    public enum DueByFilter {
        ALL,
        NOT_ADDED,
        OVERDUE,
        DUE_TODAY,
        DUE_THIS_WEEK,
        DUE_LATER
    }

    public enum SortOption {
        NEWEST_TO_OLDEST,
        OLDEST_TO_NEWEST
    }
}
