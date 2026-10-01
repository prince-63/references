package com.dentalstack.patient.feature.events.repository;

import com.dentalstack.patient.feature.events.entity.Event;
import com.dentalstack.patient.feature.events.enums.EventType;
import com.dentalstack.patient.global.enums.UserType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByUserIdAndUserTypeAndForUserIdAndForUserTypeAndActiveAndType(
            Long userId, UserType userType, Long forUserId, UserType forUserType, boolean active, EventType type);
}
