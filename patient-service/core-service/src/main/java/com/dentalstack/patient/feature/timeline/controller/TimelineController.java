package com.dentalstack.patient.feature.timeline.controller;

import com.dentalstack.patient.feature.notification.enums.NotificationType;
import com.dentalstack.patient.feature.timeline.dto.*;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.enums.UserType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Timeline", description = "Timeline APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/timeline/v1")
public class TimelineController {

    private final TimelineService timelineService;

    @GetMapping("/updates/{doctor_id}")
    @Operation(summary = "Get the all updates of all the patients of the doctor")
    public ResponseEntity<AllUpdates> getAllUpdates(
            @PathVariable(value = "doctor_id") Long doctorId,
            @RequestParam(value = "patient_id", required = false) Long patientId,
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestParam(value = "event_type", required = false) Set<EventType> allowedEventTypes,
            @RequestParam(value = "page", required = false, defaultValue = "0") Long page,
            @RequestParam(value = "size", required = false, defaultValue = "10") Long size,
            @RequestParam(value = "paginated", required = false, defaultValue = "false") Boolean paginated) {
        var updates = timelineService.getPatientTimelineEvents(
                doctorId, patientId, active, allowedEventTypes, page, size, paginated);
        return ResponseEntity.ok(updates);
    }

    @GetMapping("/event/ids/{doctor_id}")
    @Operation(summary = "Get the event ids of the doctor")
    public ResponseEntity<List<Long>> getTheEventIds(
            @PathVariable(value = "doctor_id") Long doctorId,
            @RequestParam(value = "patient_id") Long patientId,
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestParam(value = "event_type", required = false) List<EventType> allowedEventTypes) {
        var eventIds = timelineService.getEventIds(doctorId, patientId, active, allowedEventTypes);
        return ResponseEntity.ok(eventIds);
    }

    @Deprecated
    @GetMapping("/updates/page/{doctor_id}")
    @Operation(summary = "Get all updates of all the patients of the doctor")
    public ResponseEntity<AllUpdates> getAllUpdates(
            @PathVariable(value = "doctor_id") Long doctorId,
            @RequestParam(value = "patient_id", required = false) Long patientId,
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestParam(value = "event_type", required = false) Set<EventType> allowedEventTypes,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        var updates =
                timelineService.getAllUpdates(doctorId, patientId, active, allowedEventTypes, page, size, null, null);

        return ResponseEntity.ok(updates);
    }

    @GetMapping("/{user_type}/{user_id}")
    @Operation(summary = "Get the timeline of the user")
    public ResponseEntity<TimelineDetails> getTimeline(
            @PathVariable("user_type") UserType userType,
            @PathVariable("user_id") Long userId,
            @RequestParam(value = "only_active", required = false, defaultValue = "true") Boolean onlyActive) {
        return ResponseEntity.ok(timelineService.getEvents(userType, userId, onlyActive));
    }

    @PostMapping("/event/inactivate")
    @Operation(summary = "Inactivate the event.")
    public ResponseEntity<EventDetails> inactivateEvent(@RequestBody InactivateEventRequest request) {
        return ResponseEntity.ok(EventDetails.from(timelineService.inactivateEvent(request.getEventId())));
    }

    @PostMapping("/events/inactivate")
    @Operation(summary = "Inactivate multiple events.")
    public ResponseEntity<AllEventDetails> inactivateEvents(@Valid @RequestBody InactivateEventsRequest request) {
        var events = timelineService.inactivateEvents(request.getEventIds());
        return ResponseEntity.ok(
                new AllEventDetails(events.stream().map(EventDetails::from).toList()));
    }

    @PostMapping("/events/read")
    @Operation(summary = "Read multiple events.")
    public ResponseEntity<AllEventDetails> readEvents(@Valid @RequestBody InactivateEventsRequest request) {
        var events = timelineService.readEvents(request.getEventIds());
        return ResponseEntity.ok(
                new AllEventDetails(events.stream().map(EventDetails::from).toList()));
    }

    @GetMapping("/events/read/all/{doctor_id}/{notification_type}")
    @Operation(summary = "Read all events.")
    public ResponseEntity<AllEventDetails> readAllEvent(
            @PathVariable("doctor_id") long doctorId,
            @PathVariable("notification_type") NotificationType notificationType) {
        List<Event> events = timelineService.readAllEvents(doctorId, notificationType);

        return ResponseEntity.ok(
                new AllEventDetails(events.stream().map(EventDetails::from).toList()));
    }

    @PostMapping("/event")
    @Operation(summary = "Add new event")
    public void addEvent(@RequestBody AddEventRequest request) {
        timelineService.addEvent(
                request.getUserId(),
                request.getUserType(),
                request.getForUserId(),
                request.getForUserType(),
                request.getEventType(),
                request.getEventMetadata());
    }

    @PostMapping("/without/patient/event")
    @Operation(summary = "Add new event")
    public void addEventWithoutPatient(@RequestBody AddEventRequest request) {
        timelineService.addEvent(
                request.getUserId(),
                request.getUserType(),
                request.getForUserId(),
                request.getForUserType(),
                request.getEventType(),
                request.getEventMetadata(),
                request.getProfileId());
    }

    @PostMapping("/note")
    @Operation(summary = "Add timeline note event")
    public void addTimelineNoteEvent(@RequestBody AddTimelineNoteEventRequest request) {
        timelineService.addTimelineNoteEvent(request);
    }

    @GetMapping("/progress-photos/{doctor_id}")
    @Operation(summary = "Get recent aligner check-in progress photos - optimized for performance")
    public ResponseEntity<ProgressPhotoResponse> getRecentProgressPhotos(
            @PathVariable("doctor_id") Long doctorId,
            @RequestParam(value = "patient_id", required = false) Long patientId,
            @RequestParam(value = "limit", required = false, defaultValue = "3") int limit) {
        return ResponseEntity.ok(timelineService.getRecentAlignerCheckInPhotos(doctorId, patientId, limit));
    }
}
