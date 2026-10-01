package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class CreateServiceRequestDto {
    @NotNull(message = "Profile ID is required")
    private Long profileId;

    @NotNull(message = "Organization ID is required")
    private Long orgId;

    private String subscriptionType;
    private List<String> serviceProducts;
    private Map<String, String> serviceProductLabel;
}
