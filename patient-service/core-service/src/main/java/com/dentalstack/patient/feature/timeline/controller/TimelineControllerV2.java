package com.dentalstack.patient.feature.timeline.controller;

import com.dentalstack.patient.feature.timeline.dto.AllUpdates;
import com.dentalstack.patient.feature.timeline.dto.EventGetRequest;
import com.dentalstack.patient.feature.timeline.dto.EventReadRequest;
import com.dentalstack.patient.feature.timeline.dto.TimelineDetailsWithPagination;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.enums.UserType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Timeline v2", description = "Timeline v2 APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/timeline/v2")
public class TimelineControllerV2 {

    private final TimelineService timelineService;

    @PostMapping("/updates/page")
    @Operation(summary = "Get all updates of all the patients of the doctor")
    public ResponseEntity<AllUpdates> getAllUpdates(@Valid @RequestBody EventGetRequest request) {

        var updates = timelineService.getAllUpdates(
                request.getDoctorId(),
                request.getPatientId(),
                request.getActive(),
                request.getAllowedEventTypes(),
                request.getPage(),
                request.getSize(),
                request.getProfileId(),
                request.getOrganizationId());

        return ResponseEntity.ok(updates);
    }

    @PostMapping("/read/all")
    @Operation(summary = "Read all events of profile id")
    public ResponseEntity<List<Long>> readAllEventByProfileId(@Valid @RequestBody EventReadRequest request) {
        return ResponseEntity.ok(timelineService.readAllEventsByProfileId(request));
    }

    @GetMapping("/{user_type}/{patient_id}")
    @Operation(summary = "Get the timeline of the user")
    public ResponseEntity<TimelineDetailsWithPagination> getTimeline(
            @PathVariable("user_type") UserType userType,
            @PathVariable("patient_id") Long patientId,
            @RequestParam(value = "only_active", required = false, defaultValue = "true") Boolean onlyActive,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size) {
        return ResponseEntity.ok(
                timelineService.getEventsV2WithPagination(userType, patientId, onlyActive, page, size));
    }
}
