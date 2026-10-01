package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.timeline.enums.EventType;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class Update {
    private Long eventId;
    private Long patientId;
    private EventType eventType;
    private ZonedDateTime eventAt;
    private String patientName;
    private String patientProfileImageUrl;
    private boolean active;
    private boolean read;
}
