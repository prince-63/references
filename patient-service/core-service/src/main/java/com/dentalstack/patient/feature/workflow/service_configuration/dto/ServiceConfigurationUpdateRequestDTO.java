package com.dentalstack.patient.feature.workflow.service_configuration.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceConfigurationUpdateRequestDTO {

    @NotNull(message = "Profile ID is required")
    private Long profileId;

    @NotEmpty(message = "At least one service item must be specified")
    private Set<Long> serviceItemIds;

    @NotNull(message = "Action is required (ENABLE/DISABLE)")
    private ServiceAction action;

    public enum ServiceAction {
        ENABLE,
        DISABLE,
        REMOVE
    }
}
