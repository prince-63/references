package com.dentalstack.patient.feature.search.controller.v2;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GlobalSearchRequest {
    private String query;
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
}
