package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.user.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddEventRequest {
    private Long userId;
    private UserType userType;
    private Long forUserId;
    private UserType forUserType;

    private EventType eventType;
    private EventMetadata eventMetadata;
    private Long profileId;
}
