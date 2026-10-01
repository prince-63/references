package com.dentalstack.patient.feature.workflow.service_configuration.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnableDisableServiceItemsRequestDTO {

    @NotNull(message = "Profile ID is required")
    private Long profileId;

    @NotEmpty(message = "At least one service item must be specified")
    private Set<Long> serviceItemIds;
}
