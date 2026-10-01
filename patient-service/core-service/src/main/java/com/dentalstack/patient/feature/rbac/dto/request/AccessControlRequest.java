package com.dentalstack.patient.feature.rbac.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccessControlRequest {

    private Long planId;
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
}
