package com.dentalstack.patient.feature.notification.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ResolveMultiOrgDetails {
    private Long organizationId;
    private String xOrgName;
}
