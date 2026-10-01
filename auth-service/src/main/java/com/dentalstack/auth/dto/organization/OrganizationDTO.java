package com.dentalstack.auth.dto.organization;

import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationDTO {
    private Long id;
    private String name;
    private String token;
    private boolean active;
    private int requestsPerMinute;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private String displayName;
}
