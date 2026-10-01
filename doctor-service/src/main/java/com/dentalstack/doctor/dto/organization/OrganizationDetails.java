package com.dentalstack.doctor.dto.organization;

import com.dentalstack.doctor.entity.organization.Organization;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrganizationDetails {
    private String name;
    private String UUID;
    private String description;
    private String logo;
    private boolean active;

    public static OrganizationDetails from(Organization organization) {
        return OrganizationDetails.builder()
                .name(organization.getName())
                .description(organization.getDescription())
                .logo(organization.getLogo())
                .active(organization.isActive())
                .build();
    }
}
