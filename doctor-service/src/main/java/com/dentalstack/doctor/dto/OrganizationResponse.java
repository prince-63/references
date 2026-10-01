package com.dentalstack.doctor.dto;

import com.dentalstack.doctor.entity.organization.Organization;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrganizationResponse {
    private Long organizationId;

    public static OrganizationResponse from(Organization organization) {
        return OrganizationResponse.builder()
                .organizationId(organization.getId())
                .build();
    }
}
