package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long eventId;
    private Long userId;
    private UserType userType;
    private LocalDateTime eventTime;
    private EventType type;
    private EventMetadata metadata;
    private boolean active;

    public static EventDetails from(Event event) {
        return EventDetails.builder()
                .eventId(event.getId())
                .userId(event.getUserId())
                .userType(event.getUserType())
                .eventTime(event.getEventTime())
                .type(event.getType())
                .metadata(event.getMetadata())
                .active(event.isActive())
                .build();
    }
}
