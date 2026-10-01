package com.dentalstack.doctor.dto.timeline;

import com.dentalstack.doctor.enums.UserType;
import com.dentalstack.doctor.enums.event.EventType;
import com.dentalstack.doctor.metadata.event.EventMetadata;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddEventRequest {
    private Long userId;
    private UserType userType;
    private Long forUserId;
    private UserType forUserType;

    private EventType eventType;
    private EventMetadata eventMetadata;
    private Long profileId;
}
