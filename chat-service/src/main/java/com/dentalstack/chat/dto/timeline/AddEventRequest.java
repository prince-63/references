package com.dentalstack.chat.dto.timeline;

import com.dentalstack.chat.enums.UserType;
import com.dentalstack.chat.enums.event.EventType;
import com.dentalstack.chat.metadata.EventMetadata;
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
}
