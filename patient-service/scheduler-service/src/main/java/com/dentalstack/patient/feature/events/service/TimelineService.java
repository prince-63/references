package com.dentalstack.patient.feature.events.service;

import com.dentalstack.patient.feature.events.enums.EventType;
import com.dentalstack.patient.feature.events.metadata.event.EventMetadata;
import com.dentalstack.patient.global.enums.UserType;

public interface TimelineService {

    void addEvent(
            Long userId,
            UserType userType,
            Long forUserId,
            UserType forUserType,
            EventType eventType,
            EventMetadata metadata);
}
