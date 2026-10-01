package com.dentalstack.patient.feature.timeline.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InactivateEventRequest {
    private Long eventId;
}
