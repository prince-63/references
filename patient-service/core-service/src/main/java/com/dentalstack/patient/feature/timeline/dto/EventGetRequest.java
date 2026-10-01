package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.timeline.enums.EventType;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventGetRequest {

    @NotNull
    private Long doctorId;

    private Long patientId;

    private Boolean active;

    private Set<EventType> allowedEventTypes;

    @NotNull
    private int page;

    @NotNull
    private int size;

    private Long profileId;

    private Long organizationId;
}
