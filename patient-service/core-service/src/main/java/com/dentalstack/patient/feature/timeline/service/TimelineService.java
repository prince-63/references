package com.dentalstack.patient.feature.timeline.service;

import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AddAlignerFeedbackRequest;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.doctor.entity.Organization;
import com.dentalstack.patient.feature.notification.enums.NotificationType;
import com.dentalstack.patient.feature.timeline.dto.*;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.util.List;
import java.util.Set;

public interface TimelineService {
    List<AlignerChangeUpdate> getAlignerChangeUpdates(Long doctorId, Long alignerJourneyId);

    TimelineDetails getEvents(UserType userType, Long userId, Boolean onlyActive);

    TimelineDetailsWithPagination getEventsV2WithPagination(
            UserType userType, Long patientId, Boolean onlyActive, int page, int size);

    long getTotalActiveEventCount(long doctorId, UserProfile userProfile);

    long getTotalAlignerEventActiveCount(long doctorId, UserProfile userProfile);

    AllUpdates getAllUpdates(
            Long doctorId,
            Long patientId,
            Boolean active,
            Set<EventType> allowedEventTypes,
            int page,
            int size,
            Long profileId,
            Long orgId);

    void addEvent(
            Long userId,
            UserType userType,
            Long forUserId,
            UserType forUserType,
            EventType eventType,
            EventMetadata metadata);

    void addEvent(
            Long userId,
            UserType userType,
            Long forUserId,
            UserType forUserType,
            EventType eventType,
            EventMetadata metadata,
            UserProfile orgUserProfile,
            Organization organization);

    void addEvent(
            Long userId,
            UserType userType,
            Long forUserId,
            UserType forUserType,
            EventType eventType,
            EventMetadata metadata,
            Long profileId);

    Event inactivateEvent(Long eventId);

    void updateAlignerChangeEventWithFeedbacks(
            AddAlignerFeedbackRequest request, AlignerJourney alignerJourney, int alignerNo);

    List<Event> inactivateEvents(List<Long> eventIds);

    List<Event> readEvents(List<Long> eventIds);

    void addTimelineNoteEvent(AddTimelineNoteEventRequest request);

    List<Event> readAllEvents(long doctorId, NotificationType notificationType);

    AllUpdates getPatientTimelineEvents(
            Long doctorId,
            Long patientId,
            Boolean active,
            Set<EventType> allowedEventTypes,
            Long page,
            Long size,
            Boolean paginated);

    List<Long> getEventIds(Long doctorId, Long patientId, Boolean active, List<EventType> allowedEventTypes);

    List<Long> readAllEventsByProfileId(EventReadRequest request);

    ProgressPhotoResponse getRecentAlignerCheckInPhotos(Long doctorId, Long patientId, int limit);
}
