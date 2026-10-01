package com.dentalstack.doctor.dto.doctor.profiile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationDetails {
    private long organizationId;
    private String name;
    private String description;
    private boolean active;
}
