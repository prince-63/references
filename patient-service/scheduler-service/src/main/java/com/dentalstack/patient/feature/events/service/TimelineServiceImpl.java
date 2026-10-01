package com.dentalstack.patient.feature.events.service;

import com.dentalstack.patient.feature.events.entity.Event;
import com.dentalstack.patient.feature.events.enums.EventType;
import com.dentalstack.patient.feature.events.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.events.repository.EventRepository;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.enums.UserType;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Slf4j
@Service
public class TimelineServiceImpl implements TimelineService {

    private final EventRepository eventRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final UserProfileRepository userProfileRepository;
    public static final Long SYSTEM_USER_ID = 1L;

    @Override
    public void addEvent(
            Long userId,
            UserType userType,
            Long forUserId,
            UserType forUserType,
            EventType eventType,
            EventMetadata metadata) {

        Long patientId = forUserType == UserType.PATIENT ? forUserId : userId;

        patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(patientId)
                .ifPresent(pdo -> {
                    log.info("Stored the event of type {} by {} {}", eventType, userType, userId);
                    eventRepository.save(new Event(
                            userId,
                            userType,
                            forUserId,
                            forUserType,
                            LocalDateTime.now(),
                            eventType,
                            metadata,
                            true,
                            false,
                            pdo.getUserProfile(),
                            pdo.getOrganization()));
                });
    }
}
