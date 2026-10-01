package com.dentalstack.patient.feature.workflow.service_configuration.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Set;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignServiceItemsRequestDTO {

    @NotNull(message = "Profile ID is required")
    private Long profileId;

    private Set<Long> serviceItemIds;
}
