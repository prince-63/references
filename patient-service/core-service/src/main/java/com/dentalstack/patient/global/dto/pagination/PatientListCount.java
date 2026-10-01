package com.dentalstack.patient.global.dto.pagination;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class PatientListCount {
    private Long allCount;
    private Long leadCount;
    private Long activeCount;
}
