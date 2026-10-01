package com.dentalstack.patient.feature.timeline.service;

import com.dentalstack.patient.feature.doctor.entity.Organization;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.timeline.repository.EventRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EventTriggerServiceImpl implements EventTriggerService {

    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final EventRepository eventRepository;

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

    @Override
    public void addEvent(
            Long userId,
            UserType userType,
            Long forUserId,
            UserType forUserType,
            EventType eventType,
            EventMetadata metadata,
            UserProfile orgUserProfile,
            Organization organization) {
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
                orgUserProfile,
                organization));
    }
}
