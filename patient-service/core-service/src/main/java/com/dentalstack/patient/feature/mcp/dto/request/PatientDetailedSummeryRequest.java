package com.dentalstack.patient.feature.mcp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientDetailedSummeryRequest {
    private Long profileId;
    private Long doctorId;
    private Long organizationId;
    private String query;
}
