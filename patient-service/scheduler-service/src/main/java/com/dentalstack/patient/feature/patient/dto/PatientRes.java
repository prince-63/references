package com.dentalstack.patient.feature.patient.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientRes {
    private List<Long> treatmentPlanId;
    private Long totalCount;
}
