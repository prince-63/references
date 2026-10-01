package com.dentalstack.auth.dto.organization;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrganizationRequest {

    @NotBlank(message = "Organization name cannot be empty")
    private String name;

    @NotNull(message = "Rate limit must be specified")
    @Min(value = 1, message = "Rate limit must be at least 1 request per minute")
    private Integer requestsPerMinute;
}
