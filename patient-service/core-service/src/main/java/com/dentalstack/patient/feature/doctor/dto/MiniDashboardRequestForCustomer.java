package com.dentalstack.patient.feature.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MiniDashboardRequestForCustomer {
    private Long profileId;
    private Long ownerProfileId;
    private String userType;
}
