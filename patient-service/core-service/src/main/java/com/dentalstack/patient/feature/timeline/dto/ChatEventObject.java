package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.EventMetadata;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatEventObject {
    private EventType eventType;
    private EventMetadata eventMetadata;
}
