package com.dentalstack.doctor.dto.customer_access;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerAccessAndRevokeRequest {
    private Long invitorOrganizationId;
    private Long customerProfileId;
}
