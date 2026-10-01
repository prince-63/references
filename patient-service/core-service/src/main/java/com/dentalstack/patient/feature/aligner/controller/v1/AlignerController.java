package com.dentalstack.patient.feature.aligner.controller.v1;

import com.dentalstack.patient.feature.aligner.dto.aligner.*;
import com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime.DailyWearTimeLogsResponse;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.DailyAlignerWearTime;
import com.dentalstack.patient.feature.aligner.enums.aligner.CreationStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.exception.aligner.FailedToParseChangeAlignerDetails;
import com.dentalstack.patient.feature.aligner.service.AlignerService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Aligner", description = "Aligner APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/aligner/v1")
public class AlignerController {

    private final AlignerService alignerService;

    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping("/update")
    @Operation(summary = "Update the aligner journey")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> updateAlignerJourney(
            @Valid @RequestBody UpdateAlignerJourneyRequest request) {
        AlignerJourney alignerJourney = alignerService.updateAlignerJourney(request);
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @PostMapping("/update/start-date")
    @Operation(summary = "Update the start date of aligner journey")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> updateAlignerJourneyStartDate(
            @Valid @RequestBody UpdateAlignerJourneyStartDateRequest request) {
        AlignerJourney alignerJourney =
                alignerService.updateAlignerJourneyStartDate(request.getAlignerJourneyId(), request.getStartDate());
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @PostMapping("/start")
    @Operation(summary = "Start the aligner journey now")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> startAlignerJourney(@RequestBody StartAlignerJourneyRequest request) {
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerService.startAlignerJourney(request)));
    }

    @GetMapping("/{patient_id}")
    @Operation(
            summary = "Get aligner journey details",
            description =
                    """
By default, patient's aligner journey that is currently in progress will sent.
i.e., `creation_status` = `DONE` and `progress_status` = `IN_PROGRESS`.

- `creation_status` will be `IN_PROGRESS` if doctor has not completely created the treatment plan.
- `creation_status` will be `DONE` if doctor has completely created the treatment plan and patient can start the treatment,
now or in the future.
- If the patient has started the treatment then `progress_status` will be `IN_PROGRESS`.
- If the patient has not started the treatment then `progress_status` will be `NOT_STARTED`.
- If the patient has completed the treatment then `progress_status` will be `COMPLETED`.
- The `progress_status` will be `DISCARDED` if patient has left the treatment in-between.
""")
    public ResponseEntity<AllAlignerJourneyDetails> getAlignerJourney(
            @PathVariable("patient_id") Long patientId,
            @RequestParam(value = "create_status", required = false) List<CreationStatus> creationStatuses,
            @RequestParam(value = "progress_status", required = false) List<ProgressStatus> progressStatuses,
            @RequestParam(value = "aligner_journey_id", required = false) Long alignerJourneyId) {
        if (creationStatuses == null || creationStatuses.isEmpty()) {
            creationStatuses = List.of(CreationStatus.DONE);
        }
        if (progressStatuses == null || progressStatuses.isEmpty()) {
            progressStatuses = List.of(ProgressStatus.IN_PROGRESS);
        }

        AllAlignerJourneyDetails resp = alignerService.getAlignerJourneyDetails(
                patientId, creationStatuses, progressStatuses, alignerJourneyId);
        return ResponseEntity.ok(resp);
    }

    @PostMapping(
            value = "/change/aligner",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Set current aligner")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> changeAligner(
            @Parameter(
                            name = "details",
                            example =
                                    """
                                            {
                                              "patient_id": 1,
                                              "aligner_journey_id": 1,
                                              "new_aligner_no": 2,
                                              "previous_aligner_change_date": "2023-09-29",
                                              "aligner_feedbacks": [
                                                  {
                                                    "jaw_type": "LOWER",
                                                    "feedback_type": "ALIGNER_CHANGE",
                                                    "fitting_feedbacks": {
                                                      "fittings": ["PERFECT_FIT", "LOOSE_AT_BACK", "LOOSE_AT_FRONT", "NOT_FITTING"]
                                                    },
                                                    "changing_feedbacks": {
                                                      "aligner_changing_issues": ["BROKEN_CRACKED_ALIGNER", "SHARP_EDGES", "MISSING_ALIGNER"]
                                                    },
                                                    "other_issues": "Some other comments"
                                                  },
                                              ],
                                              "with_previous_aligner_photo_files": [
                                                {
                                                  "original_filename":"previous_aligner_photo.jpg",
                                                  "save_as_filename": "previous_aligner_photo_new.jpg"
                                                }
                                              ],
                                              "with_new_aligner_photo_files": [
                                                {
                                                  "original_filename":"new_aligner_photo.jpg",
                                                  "save_as_filename": "new_aligner_photo_new.jpg"
                                                }
                                              ],
                                              "without_new_aligner_photo_files": [
                                                {
                                                  "original_filename":"new_without_aligner_photo.jpg",
                                                  "save_as_filename": "new_without_aligner_photo_new.jpg"
                                                }
                                              ]
                                            }
                                            """)
                    @RequestParam("details")
                    String reqStr,
            @RequestPart(value = "photo", required = false) MultipartFile[] photos) {

        ChangeAlignerRequest request = new ChangeAlignerRequest();
        try {
            mapper.registerModule(new JavaTimeModule());
            request = mapper.readValue(reqStr, ChangeAlignerRequest.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed to aligner change request, {}", reqStr, e);
            throw new FailedToParseChangeAlignerDetails(reqStr, e);
        }

        AlignerJourney alignerJourney = alignerService.changeAligner(request, photos);
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @PostMapping("/change/aligner/previous")
    @Operation(summary = "Move to previous aligner")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> moveToPreviousAligner(
            @Valid @RequestBody MoveToPreviousAlignerRequest request) {
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerService.moveToPreviousAligner(request)));
    }

    @PostMapping("/discard/{aligner_journey_id}")
    @Operation(summary = "Discard the aligner journey")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> discardAlignerJourney(
            @PathVariable("aligner_journey_id") Long alignerJourneyId) {
        AlignerJourney alignerJourney = alignerService.discardAlignerJourney(alignerJourneyId);
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @PostMapping("{patient_id}/wearing/duration")
    @Operation(
            summary = "Update aligner wearing status",
            description =
                    """
Duration to be added in daily wear time of the aligner. Daily out time will be automatically calculated as follows,
daily total out time = total time passed till now - daily total wear time.
""")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> setDailyWearTime(
            @PathVariable("patient_id") Long patientId, @Valid @RequestBody UpdateAlignerWearingStatus request) {
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerService.setDailyWearTime(
                patientId, request.getWearingDurationInSec(), request.getDate(), request.getAlignerSrNo())));
    }

    @GetMapping("/{patient_id}/wearing/logs")
    @Operation(
            summary = "Get daily wear time logs",
            description =
                    """
                Get paginated daily wear time logs for a patient.
                Returns logs with latest dates first.
                Each log entry contains the date, total duration, and estimated in/out sessions.
                Note: Sessions are estimated based on daily totals since detailed session tracking
                wasn't available in the original implementation.
                """)
    public ResponseEntity<DailyWearTimeLogsResponse> getDailyWearTimeLogs(
            @PathVariable("patient_id") Long patientId,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page number must be non-negative") int page,
            @RequestParam(defaultValue = "20")
                    @Min(value = 1, message = "Page size must be positive")
                    @Max(value = 100, message = "Page size cannot exceed 100")
                    int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        DailyWearTimeLogsResponse logs = alignerService.getDailyWearTimeLogs(patientId, page, size, fromDate, toDate);

        return ResponseEntity.ok(logs);
    }

    @GetMapping("/stats/{patient_id}/aligner_wise")
    @Operation(summary = "Get the average wear time stats of all aligners")
    @Transactional(readOnly = true)
    public ResponseEntity<AlignerWiseStats> getAlignerWiseStats(
            @PathVariable("patient_id") Long patientId,
            @RequestParam(value = "aligner_journey_id", required = false) Long alignerJourneyId) {
        AlignerJourney alignerJourney = (alignerJourneyId != null)
                ? alignerService.getAlignerJourney(alignerJourneyId)
                : alignerService.getCurrentAlignerJourney(patientId);

        return ResponseEntity.ok(AlignerWiseStats.from(alignerJourney));
    }

    @GetMapping("/stats/{patient_id}/date_wise/{aligner_no}")
    @Operation(summary = "Get the date-wise wear time stats of a particular aligner")
    @Transactional(readOnly = true)
    public ResponseEntity<DateWiseAlignerStats> getDateWiseStats(
            @PathVariable("aligner_no") Integer alignerNo,
            @PathVariable("patient_id") Long patientId,
            @RequestParam(value = "start_date", required = false) LocalDate startDate,
            @RequestParam(value = "end_date", required = false) LocalDate endDate,
            @RequestParam(value = "aligner_journey_id", required = false) Long alignerJourneyId) {
        AlignerJourney alignerJourney = (alignerJourneyId != null)
                ? alignerService.getAlignerJourney(alignerJourneyId)
                : alignerService.getCurrentAlignerJourney(patientId);
        Aligner aligner = alignerJourney.getAligner(alignerNo);
        if (startDate == null) {
            startDate = aligner.getStartDate();
        }
        if (endDate == null) {
            if (aligner.getChangeDate() != null) {
                endDate = aligner.getChangeDate();
            } else {

                endDate = aligner.getEndDate();
                var today = LocalDate.now();
                if (endDate.isBefore(today)) {
                    endDate = today;
                }
            }
        }
        List<DailyAlignerWearTime> wearTimes = aligner.getDailyWearTimeRecords();
        long untrackedDays =
                wearTimes.stream().filter(w -> w.getTotalWearTimeSecs() == 0).count();

        long ghostLogs = wearTimes.stream()
                .filter(w -> w.getTotalWearTimeSecs() >= 86400)
                .count();

        return ResponseEntity.ok(
                DateWiseAlignerStats.from(alignerJourney, aligner, startDate, endDate, untrackedDays, ghostLogs));
    }

    @GetMapping("/stats/{patient_id}")
    @Operation(summary = "Get the stats of aligner journey")
    @Transactional(readOnly = true)
    public ResponseEntity<AlignerJourneyStats> getAlignerStats(
            @PathVariable("patient_id") Long patientId,
            @RequestParam(value = "start_date", required = false) LocalDate startDate,
            @RequestParam(value = "end_date", required = false) LocalDate endDate,
            @RequestParam(value = "aligner_journey_id", required = false) Long alignerJourneyId) {
        AlignerJourney alignerJourney = (alignerJourneyId != null)
                ? alignerService.getAlignerJourney(alignerJourneyId)
                : alignerService.getCurrentAlignerJourney(patientId);

        if (startDate == null) {
            Aligner firstAligner = alignerJourney.getFirstAligner();
            if (firstAligner.getStartDate() != null) {
                startDate = firstAligner.getStartDate();
            } else startDate = LocalDate.now().minusDays(7);
        }
        if (endDate == null) endDate = LocalDate.now();

        List<DailyAlignerWearTime> records = alignerJourney.getDailyWearTimeRecords(startDate, endDate);

        return ResponseEntity.ok(AlignerJourneyStats.from(alignerJourney, records));
    }

    @GetMapping("/consistency/alert/{patientId}")
    public ResponseEntity<ConsistencyAlertDetails> getConsistencyAlertDetails(
            @PathVariable(name = "patientId") Long patientId) {
        return ResponseEntity.ok(alignerService.getConsistencyAlertDetails(patientId));
    }

    @PostMapping("/update/wear-days")
    @Operation(summary = "Update the wear days of the aligners")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> updateWearDays(@RequestBody @Valid UpdateWearDaysRequest request) {
        AlignerJourney alignerJourney = alignerService.updateWearDays(request);
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @PostMapping("/update/aligner")
    @Operation(summary = "Update the individual aligner")
    public ResponseEntity<AlignerJourneyDetails> updateAligner(@RequestBody @Valid UpdateAlignerRequest request) {
        return ResponseEntity.ok((alignerService.updateAligner(request)));
    }

    @PostMapping("/filter")
    @Operation(summary = "Get patient list according to the aligner filter")
    public ResponseEntity<List<AlignerJourneyPatientDetails>> getPatientAccordingToAlignerFilter(
            @RequestBody @Valid AlignerJourneyFilterRequest request) {
        return ResponseEntity.ok(alignerService.getPatientAccordingToAlignerFilter(request));
    }
}
