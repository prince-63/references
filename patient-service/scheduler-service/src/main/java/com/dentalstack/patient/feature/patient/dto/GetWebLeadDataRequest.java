package com.dentalstack.patient.feature.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GetWebLeadDataRequest {
    private long doctorId;
    private long organizationId;
    private long profileId;
}
