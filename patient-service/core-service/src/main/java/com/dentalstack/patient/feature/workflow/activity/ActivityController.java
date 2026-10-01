package com.dentalstack.patient.feature.workflow.activity;

import com.dentalstack.patient.feature.workflow.activity.dto.ActivityGetRequestDTO;
import com.dentalstack.patient.feature.workflow.activity.dto.ActivityLogListResponse;
import com.dentalstack.patient.feature.workflow.activity.dto.ActivityResponseDTO;
import com.dentalstack.patient.feature.workflow.activity.dto.TimelineResponseDTO;
import com.dentalstack.patient.feature.workflow.activity.service.ActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/workflow/activities")
@AllArgsConstructor
@Tag(
        name = "Activity Management",
        description = "Endpoints for managing and retrieving workflow activities for patients")
public class ActivityController {

    private final ActivityLogService activityLogService;

    @Operation(
            summary = "Get all activities for a patient",
            description = "Fetches the complete list of workflow activities associated with a given patient ID.",
            parameters = {
                @Parameter(
                        name = "patientId",
                        description = "Unique identifier of the patient",
                        required = true,
                        example = "123")
            },
            responses = {
                @ApiResponse(
                        responseCode = "200",
                        description = "List of activities retrieved successfully",
                        content =
                                @Content(
                                        mediaType = "application/json",
                                        array =
                                                @ArraySchema(
                                                        schema = @Schema(implementation = ActivityResponseDTO.class)))),
                @ApiResponse(
                        responseCode = "404",
                        description = "No activities found for the given patientId",
                        content = @Content),
                @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
            })
    @PostMapping("/get/all")
    public ResponseEntity<ActivityLogListResponse<ActivityResponseDTO>> getAllActivities(
            @RequestBody ActivityGetRequestDTO request) {
        ActivityLogListResponse<ActivityResponseDTO> activities = activityLogService.getActivityLogs(request);
        return ResponseEntity.ok(activities);
    }

    @PostMapping("/get/comments-and-activities")
    public ResponseEntity<ActivityLogListResponse<TimelineResponseDTO>> getMergeCommentsAndActivities(
            @RequestBody ActivityGetRequestDTO request) {
        ActivityLogListResponse<TimelineResponseDTO> items = activityLogService.getMergeCommentsAndActivities(request);
        return ResponseEntity.ok(items);
    }
}
