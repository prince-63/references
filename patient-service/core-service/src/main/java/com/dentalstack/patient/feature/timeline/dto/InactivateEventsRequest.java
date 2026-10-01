package com.dentalstack.patient.feature.timeline.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InactivateEventsRequest {
    @NotNull
    private List<Long> eventIds;
}
