package com.dentalstack.patient.feature.calendar.service.impl;

import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.entity.action.metadata.AlignerCheckInMetadata;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.aligner.projection.AlignerActionDetailsSummary;
import com.dentalstack.patient.feature.aligner.projection.AlignerChangeDetailsSummary;
import com.dentalstack.patient.feature.aligner.repository.AlignerAnalyticsQueryRepository;
import com.dentalstack.patient.feature.aligner.repository.action.AlignerActionRepository;
import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.calendar.dto.calendar.CalendarReminderResponse;
import com.dentalstack.patient.feature.calendar.dto.calendar.CalendarRequest;
import com.dentalstack.patient.feature.calendar.dto.calendar.details.*;
import com.dentalstack.patient.feature.calendar.enums.CalendarResponseTypes;
import com.dentalstack.patient.feature.calendar.service.CalendarService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.projection.PatientSummary;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.reminder.entity.*;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionPlanDTO;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionUserMappingRepository;
import com.dentalstack.patient.feature.tracking.projection.TrackingSummary;
import com.dentalstack.patient.feature.tracking.repository.TrackingRepository;
import com.dentalstack.patient.global.config.TimezoneConfig;
import java.time.*;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Slf4j
@Service
public class CalendarServiceImpl implements CalendarService {

    private final ReminderRepository reminderRepository;
    private final TrackingRepository trackingRepository;
    private final PatientRepository patientRepository;
    private final AlignerActionRepository alignerActionRepository;
    private final AlignerAnalyticsQueryRepository alignerAnalyticsQueryRepository;
    private final BracesJourneyRepository bracesJourneyRepository;
    private final SubscriptionUserMappingRepository subscriptionUserMappingRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;

    @Qualifier("calendarExecutor")
    private final Executor calendarExecutor;

    private final AtomicLong idGenerator = new AtomicLong(1);

    private long generateCustomId() {
        return idGenerator.getAndIncrement();
    }

    @Override
    public List<CalendarReminderResponse> getCalendarReminders(CalendarRequest request) {
        long startingId = idGenerator.get();
        AtomicLong localIdGenerator = new AtomicLong(startingId);

        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();

        LocalDate adjustedEndDate = endDate.plusDays(1);

        ZonedDateTime zonedStartDateTime = startDate.atStartOfDay(TimezoneConfig.DEFAULT_ZONE_ID);
        ZonedDateTime zonedEndDateTime = endDate.atStartOfDay(TimezoneConfig.DEFAULT_ZONE_ID);

        var doctorId = request.getDoctorId();

        var patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfile(
                doctorId, request.getOrganizationId(), request.getProfileId());

        var reminderStatuses = List.of(ReminderStatus.ACTIVE, ReminderStatus.TRIGGERED);
        List<Reminder> reminders = reminderRepository.findByDoctorAndDateRangeAndStatuses(
                request.getProfileId(), startDate, adjustedEndDate, reminderStatuses);

        List<TrackingSummary> pausedTrackings =
                trackingRepository.findTrackingDetailsForCalendarByPatients(startDate, adjustedEndDate, patientIds);

        List<AlignerChangeDetailsSummary> alignerChangeDetails =
                alignerAnalyticsQueryRepository.findAlignerChangeDetailsByPatientIdsAndChangeDateBetween(
                        patientIds, startDate, adjustedEndDate);

        List<AlignerActionDetailsSummary> alignerActions =
                alignerActionRepository.findAlignerActionDetailsForPatientsWithinDateRange(
                        patientIds, AlignerActionType.CHECK_IN, zonedStartDateTime, zonedEndDateTime, true);

        List<CalendarReminderResponse> reminderResponses = reminders.stream()
                .map(reminder -> {
                    Object details;
                    CalendarResponseTypes calendarResponseTypes;

                    switch (reminder.getPurpose()) {
                        case PAYMENTS_PENDING:
                            PaymentReminderMetadata paymentMetadata = (PaymentReminderMetadata) reminder.getMetadata();
                            calendarResponseTypes = CalendarResponseTypes.PAYMENT_REMINDER;
                            details = PaymentCalendarDetails.from(
                                    paymentMetadata.getNotes(),
                                    paymentMetadata.getPatientDetails().getFullName(),
                                    paymentMetadata.getPatientDetails().getProfilePictureUrl(),
                                    reminder.getId(),
                                    paymentMetadata.getAmount(),
                                    paymentMetadata.getPatientDetails().getId(),
                                    reminder.getDate(),
                                    reminder.getTime(),
                                    reminder.getTitle());
                            break;

                        case APPOINTMENT_REMINDER:
                            AppointmentReminderMetadata appointmentMetadata =
                                    (AppointmentReminderMetadata) reminder.getMetadata();
                            calendarResponseTypes = CalendarResponseTypes.APPOINTMENT_REMINDER;
                            details = AppointmentCalendarDetails.from(
                                    appointmentMetadata.getNotes(),
                                    appointmentMetadata.getPatientDetails().getFullName(),
                                    appointmentMetadata.getPatientDetails().getProfilePictureUrl(),
                                    reminder.getId(),
                                    appointmentMetadata.getPatientDetails().getId(),
                                    reminder.getDate(),
                                    reminder.getTime(),
                                    reminder.getTitle());
                            break;

                        case PRODUCTION_ALIGNER_STATUS_PENDING:
                            ProdutionReminderMetadata alignerMetadata =
                                    (ProdutionReminderMetadata) reminder.getMetadata();
                            calendarResponseTypes = CalendarResponseTypes.PRODUCTION_REMINDER;
                            details = ProductionReminderCalendarDetails.from(
                                    alignerMetadata.getNotes(),
                                    alignerMetadata.getPatientDetails().getFullName(),
                                    alignerMetadata.getPatientDetails().getProfilePictureUrl(),
                                    reminder.getId(),
                                    alignerMetadata.getPatientDetails().getId(),
                                    reminder.getDate(),
                                    reminder.getTime(),
                                    reminder.getTitle(),
                                    alignerMetadata.getAlignerJourneyId());
                            break;

                        case GENERAL_REMINDER:
                            GeneralReminderMetadata generalMetadata = (GeneralReminderMetadata) reminder.getMetadata();
                            calendarResponseTypes = CalendarResponseTypes.GENERAL_REMINDER;
                            if (generalMetadata.getPatientDetails() != null) {
                                details = GeneralReminderCalendarDetails.from(
                                        generalMetadata.getNotes(),
                                        generalMetadata.getPatientDetails().getFullName(),
                                        generalMetadata.getPatientDetails().getProfilePictureUrl(),
                                        generalMetadata.getPatientDetails().getId(),
                                        reminder.getDate(),
                                        reminder.getTime(),
                                        reminder.getTitle(),
                                        reminder.getId());
                            } else {
                                details = GeneralReminderCalendarDetails.from(
                                        generalMetadata.getNotes(),
                                        null,
                                        null,
                                        null,
                                        reminder.getDate(),
                                        reminder.getTime(),
                                        reminder.getTitle(),
                                        reminder.getId());
                            }

                            break;

                        case APPOINTMENT:
                            CustomAppointmentReminderMetadata customAppointmentReminderMetadata =
                                    (CustomAppointmentReminderMetadata) reminder.getMetadata();

                            calendarResponseTypes = CalendarResponseTypes.APPOINTMENT;
                            var bracesJourney = bracesJourneyRepository.findByPatientIdAndBracesTreatmentStage(
                                    customAppointmentReminderMetadata
                                            .getPatientDetails()
                                            .getId(),
                                    BracesTreatmentStage.ACTIVE);
                            Long bracesJourneyId = null;
                            if (bracesJourney.isPresent()) {
                                bracesJourneyId = bracesJourney.get().getId();
                            }
                            details = CustomAppointmentCalendarDetails.from(
                                    customAppointmentReminderMetadata.getNotes(),
                                    customAppointmentReminderMetadata
                                            .getPatientDetails()
                                            .getFullName(),
                                    customAppointmentReminderMetadata
                                            .getPatientDetails()
                                            .getProfilePictureUrl(),
                                    customAppointmentReminderMetadata.getStartDate(),
                                    customAppointmentReminderMetadata.getEndDate(),
                                    reminder.getId(),
                                    customAppointmentReminderMetadata.getPatientId(),
                                    customAppointmentReminderMetadata.getPracticeLocationId(),
                                    customAppointmentReminderMetadata.getPracticeLocationName(),
                                    customAppointmentReminderMetadata.getPracticeLocationCity(),
                                    customAppointmentReminderMetadata.getAmount(),
                                    bracesJourneyId,
                                    customAppointmentReminderMetadata.getIsBracesNotesAdded() != null
                                            ? customAppointmentReminderMetadata.getIsBracesNotesAdded()
                                            : false,
                                    customAppointmentReminderMetadata.getAppointmentId());
                            break;

                        case TREATMENT_START_REMINDER:
                            TreatementStartReminderMetadata treatementStartReminderMetadata =
                                    (TreatementStartReminderMetadata) reminder.getMetadata();
                            var patient = patientRepository
                                    .findById(treatementStartReminderMetadata.getPatientId())
                                    .orElseThrow(() -> new PatientNotFoundException("Patient not found"));
                            calendarResponseTypes = CalendarResponseTypes.TREATMENT_START_REMINDER;
                            details = TreatmentStartDetails.from(
                                    patient.fullName(),
                                    patient.getProfilePictureUrl(),
                                    reminder.getId(),
                                    patient.getId(),
                                    reminder.getDate(),
                                    reminder.getTime(),
                                    reminder.getTitle() != null
                                            ? reminder.getTitle()
                                            : reminder.getPurpose().name());
                            break;

                        case UNPROCESSED_ALIGNER_REMINDER:
                            UnprocessedAlignerReminderMetadata unprocessedAlignerReminderMetadata =
                                    (UnprocessedAlignerReminderMetadata) reminder.getMetadata();
                            var patientForUnprocessedAligner = patientRepository
                                    .findById(unprocessedAlignerReminderMetadata.getPatientId())
                                    .orElseThrow(() -> new PatientNotFoundException("Patient not found"));
                            calendarResponseTypes = CalendarResponseTypes.TREATMENT_START_REMINDER;
                            details = UnprocessedAlignerCalenderDetails.from(
                                    patientForUnprocessedAligner.fullName(),
                                    patientForUnprocessedAligner.getProfilePictureUrl(),
                                    reminder.getId(),
                                    patientForUnprocessedAligner.getId(),
                                    reminder.getDate(),
                                    reminder.getTime(),
                                    reminder.getTitle() != null
                                            ? reminder.getTitle()
                                            : reminder.getPurpose().name(),
                                    unprocessedAlignerReminderMetadata.getTreatmentPlanId());
                            break;
                        default:
                            throw new IllegalStateException("Unexpected value: " + reminder.getPurpose());
                    }

                    return new CalendarReminderResponse(
                            localIdGenerator.getAndIncrement(),
                            reminder.getTitle(),
                            createSafeZonedDateTime(reminder.getDate(), reminder.getTime(), reminder.getZone()),
                            calendarResponseTypes,
                            details);
                })
                .toList();

        List<CalendarReminderResponse> pausedTrackingResponses = pausedTrackings.stream()
                .map(tracking -> {
                    var patient = patientRepository.findPatientSummaryById(tracking.getPatientId());
                    String firstName = patient.getFirstName();
                    String lastName = patient.getLastName();
                    String fullName = fullName(firstName, lastName);

                    TreatmentPausedCalendarDetails pausedDetails = TreatmentPausedCalendarDetails.from(
                            tracking.getReasonForPausing(),
                            fullName,
                            patient.getProfilePictureUrl(),
                            tracking.getPauseDate(),
                            tracking.getResumeDate(),
                            tracking.getPatientId(),
                            tracking.getAlignerJourneyId());

                    CalendarResponseTypes calendarResponseTypes = CalendarResponseTypes.RESUME_TREATMENT_REMINDER;

                    return new CalendarReminderResponse(
                            localIdGenerator.getAndIncrement(),
                            null,
                            tracking.getResumeDate().atTime(10, 0).atZone(TimezoneConfig.DEFAULT_ZONE_ID),
                            calendarResponseTypes,
                            pausedDetails);
                })
                .toList();

        List<CalendarReminderResponse> alignerActionResponses = alignerActions.stream()
                .map(action -> {
                    var details = (AlignerCheckInMetadata) action.getMetadata();
                    boolean isPhotosUploaded = !details.getAlignerPhotoIds().isEmpty();
                    boolean isFeedbackNeedsReview =
                            !details.getAlignerFeedbackIds().isEmpty();

                    var patient = patientRepository.findPatientSummaryById(action.getPatientId());
                    String firstName = patient.getFirstName();
                    String lastName = patient.getLastName();
                    String fullName = fullName(firstName, lastName);

                    AlignerCheckInCalendarDetails alignerDetails = AlignerCheckInCalendarDetails.from(
                            fullName,
                            patient.getProfilePictureUrl(),
                            isPhotosUploaded,
                            isFeedbackNeedsReview,
                            action.getJawType(),
                            action.getAlignerNumber(),
                            action.getPatientId(),
                            action.getAlignerActionId(),
                            action.getAlignerJourneyId(),
                            action.getAlignerActionId());

                    return new CalendarReminderResponse(
                            localIdGenerator.getAndIncrement(),
                            null,
                            action.getPerformedAt(),
                            CalendarResponseTypes.ALIGNER_CHECK_IN,
                            alignerDetails);
                })
                .toList();

        List<CalendarReminderResponse> alignerChangeCalendarDetails = alignerChangeDetails.stream()
                .map(aligner -> {
                    String patientName = fullName(aligner.getFirstName(), aligner.getLastName());
                    String profileUrl = aligner.getProfileUrl();
                    JawType previousJawType = aligner.getPreviousJawType();
                    JawType currentJawType = aligner.getCurrentJawType();
                    int previousAlignerNumber = 0;
                    int currentAlignerNumber = 0;
                    if (aligner.getCurrentAlignerNumber() != null) {
                        currentAlignerNumber = aligner.getCurrentAlignerNumber();
                    }
                    if (aligner.getPreviousAlignerNumber() != null) {
                        previousAlignerNumber = aligner.getPreviousAlignerNumber();
                    }

                    LocalDate recommendedDateOfChange = aligner.getEndDate();
                    int daysDelay = aligner.getDaysDelay();

                    boolean isCheckInPerformed = aligner.getCheckInPerformed().equals("true");
                    boolean isManual = aligner.getManual().equals("true");

                    LocalDateTime performedAtLocalDateTime = aligner.getPerformedAt();
                    ZonedDateTime performedAtZoned = ZonedDateTime.of(performedAtLocalDateTime, ZoneId.systemDefault());

                    AlignerChangeCalendarDetails alignerDetails = AlignerChangeCalendarDetails.from(
                            patientName,
                            profileUrl,
                            previousJawType,
                            currentJawType,
                            previousAlignerNumber,
                            currentAlignerNumber,
                            recommendedDateOfChange,
                            daysDelay,
                            isCheckInPerformed,
                            isManual,
                            aligner.getPatientId(),
                            aligner.getAlignerJourneyId(),
                            aligner.getActionId());

                    return new CalendarReminderResponse(
                            localIdGenerator.getAndIncrement(),
                            null,
                            performedAtZoned,
                            CalendarResponseTypes.ALIGNER_CHANGED,
                            alignerDetails);
                })
                .toList();

        List<CalendarReminderResponse> combinedResponses = new ArrayList<>();
        combinedResponses.addAll(reminderResponses);
        combinedResponses.addAll(pausedTrackingResponses);
        combinedResponses.addAll(alignerActionResponses);
        combinedResponses.addAll(alignerChangeCalendarDetails);

        idGenerator.set(localIdGenerator.get());
        return combinedResponses;
    }

    @Override
    public List<CalendarReminderResponse> getCalendarRemindersV3(CalendarRequest request) {
        long startTime = System.currentTimeMillis();
        long startingId = idGenerator.get();
        AtomicLong localIdGenerator = new AtomicLong(startingId);

        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();
        LocalDate adjustedEndDate = endDate.plusDays(1);

        ZonedDateTime zonedStartDateTime = startDate.atStartOfDay(TimezoneConfig.DEFAULT_ZONE_ID);
        ZonedDateTime zonedEndDateTime = endDate.atStartOfDay(TimezoneConfig.DEFAULT_ZONE_ID);

        var doctorId = request.getDoctorId();
        var reminderStatuses = List.of(ReminderStatus.ACTIVE, ReminderStatus.TRIGGERED);

        var patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfile(
                doctorId, request.getOrganizationId(), request.getProfileId());

        if (patientIds == null || patientIds.isEmpty()) {
            return Collections.emptyList();
        }

        long afterPatientIds = System.currentTimeMillis();

        CompletableFuture<List<Reminder>> remindersFuture = CompletableFuture.supplyAsync(
                () -> reminderRepository.findByDoctorAndDateRangeAndStatuses(
                        request.getProfileId(), startDate, adjustedEndDate, reminderStatuses),
                calendarExecutor);

        CompletableFuture<List<TrackingSummary>> pausedTrackingsFuture = CompletableFuture.supplyAsync(
                () -> trackingRepository.findTrackingDetailsForCalendarByPatients(
                        startDate, adjustedEndDate, patientIds),
                calendarExecutor);

        CompletableFuture<List<AlignerChangeDetailsSummary>> alignerChangeDetailsFuture = CompletableFuture.supplyAsync(
                () -> alignerAnalyticsQueryRepository.findAlignerChangeDetailsByPatientIdsAndChangeDateBetween(
                        patientIds, startDate, adjustedEndDate),
                calendarExecutor);

        CompletableFuture<List<AlignerActionDetailsSummary>> alignerActionsFuture = CompletableFuture.supplyAsync(
                () -> alignerActionRepository.findAlignerActionDetailsForPatientsWithinDateRange(
                        patientIds, AlignerActionType.CHECK_IN, zonedStartDateTime, zonedEndDateTime, true),
                calendarExecutor);

        CompletableFuture.allOf(
                        remindersFuture, pausedTrackingsFuture, alignerChangeDetailsFuture, alignerActionsFuture)
                .join();

        List<Reminder> reminders = remindersFuture.join();
        List<TrackingSummary> pausedTrackings = pausedTrackingsFuture.join();
        List<AlignerChangeDetailsSummary> alignerChangeDetails = alignerChangeDetailsFuture.join();
        List<AlignerActionDetailsSummary> alignerActions = alignerActionsFuture.join();

        long afterParallelFetch = System.currentTimeMillis();
        log.debug(
                "[V3-Performance] Parallel fetch completed in {}ms. Reminders: {}, Trackings: {}, Changes: {}, Actions: {}",
                (afterParallelFetch - afterPatientIds),
                reminders.size(),
                pausedTrackings.size(),
                alignerChangeDetails.size(),
                alignerActions.size());

        Set<Long> allPatientIds = new HashSet<>(pausedTrackings.size() + alignerActions.size() + 20);
        Set<Long> summaryPatientIds = new HashSet<>(pausedTrackings.size() + alignerActions.size());
        Set<Long> appointmentPatientIds = new HashSet<>();

        for (Reminder r : reminders) {
            switch (r.getPurpose()) {
                case APPOINTMENT:
                    CustomAppointmentReminderMetadata appointmentMeta =
                            (CustomAppointmentReminderMetadata) r.getMetadata();
                    if (appointmentMeta.getPatientDetails() != null) {
                        Long pid = appointmentMeta.getPatientDetails().getId();
                        allPatientIds.add(pid);
                        appointmentPatientIds.add(pid);
                    }
                    break;
                case TREATMENT_START_REMINDER:
                    TreatementStartReminderMetadata treatmentMeta = (TreatementStartReminderMetadata) r.getMetadata();
                    allPatientIds.add(treatmentMeta.getPatientId());
                    break;
                case UNPROCESSED_ALIGNER_REMINDER:
                    UnprocessedAlignerReminderMetadata unprocessedMeta =
                            (UnprocessedAlignerReminderMetadata) r.getMetadata();
                    allPatientIds.add(unprocessedMeta.getPatientId());
                    break;
            }
        }

        for (TrackingSummary t : pausedTrackings) {
            Long pid = t.getPatientId();
            allPatientIds.add(pid);
            summaryPatientIds.add(pid);
        }
        for (AlignerActionDetailsSummary a : alignerActions) {
            Long pid = a.getPatientId();
            allPatientIds.add(pid);
            summaryPatientIds.add(pid);
        }

        long afterCollectIds = System.currentTimeMillis();
        log.debug(
                "[V3-Performance] Collected IDs in {}ms. All: {}, Summary: {}, Appointment: {}",
                (afterCollectIds - afterParallelFetch),
                allPatientIds.size(),
                summaryPatientIds.size(),
                appointmentPatientIds.size());

        CompletableFuture<Map<Long, Patient>> patientMapFuture = CompletableFuture.supplyAsync(
                () -> {
                    if (allPatientIds.isEmpty()) return Collections.emptyMap();
                    return patientRepository.findAllById(allPatientIds).stream()
                            .collect(Collectors.toMap(
                                    Patient::getId, p -> p, (a, b) -> a, () -> new HashMap<>(allPatientIds.size())));
                },
                calendarExecutor);

        CompletableFuture<Map<Long, PatientSummary>> patientSummaryMapFuture = CompletableFuture.supplyAsync(
                () -> {
                    if (summaryPatientIds.isEmpty()) return Collections.emptyMap();
                    return patientRepository.findByPatientIdsWithSummary(new ArrayList<>(summaryPatientIds)).stream()
                            .collect(Collectors.toMap(
                                    PatientSummary::getPatientId,
                                    s -> s,
                                    (a, b) -> a,
                                    () -> new HashMap<>(summaryPatientIds.size())));
                },
                calendarExecutor);

        CompletableFuture<Map<Long, Long>> bracesJourneyMapFuture = CompletableFuture.supplyAsync(
                () -> {
                    if (appointmentPatientIds.isEmpty()) return Collections.emptyMap();
                    return bracesJourneyRepository
                            .findByBracesTreatmentStageInAndPatientIdIn(
                                    List.of(BracesTreatmentStage.ACTIVE), new ArrayList<>(appointmentPatientIds))
                            .stream()
                            .collect(Collectors.toMap(
                                    bj -> bj.getPatient().getId(),
                                    BracesJourney::getId,
                                    (a, b) -> a,
                                    () -> new HashMap<>(appointmentPatientIds.size())));
                },
                calendarExecutor);

        CompletableFuture.allOf(patientMapFuture, patientSummaryMapFuture, bracesJourneyMapFuture)
                .join();

        Map<Long, Patient> patientMap = patientMapFuture.join();
        Map<Long, PatientSummary> patientSummaryMap = patientSummaryMapFuture.join();
        Map<Long, Long> patientToBracesJourneyMap = bracesJourneyMapFuture.join();

        long afterPatientFetch = System.currentTimeMillis();
        log.debug(
                "[V3-Performance] Patient data fetched in {}ms. Patients: {}, Summaries: {}, BracesJourneys: {}",
                (afterPatientFetch - afterCollectIds),
                patientMap.size(),
                patientSummaryMap.size(),
                patientToBracesJourneyMap.size());

        final Map<Long, Patient> finalPatientMap = patientMap;
        final Map<Long, PatientSummary> finalPatientSummaryMap = patientSummaryMap;
        final Map<Long, Long> finalPatientToBracesJourneyMap = patientToBracesJourneyMap;

        List<CalendarReminderResponse> reminderResponses = reminders.stream()
                .map(reminder -> {
                    Object details;
                    CalendarResponseTypes calendarResponseTypes;

                    switch (reminder.getPurpose()) {
                        case PAYMENTS_PENDING:
                            PaymentReminderMetadata paymentMetadata = (PaymentReminderMetadata) reminder.getMetadata();
                            calendarResponseTypes = CalendarResponseTypes.PAYMENT_REMINDER;
                            details = PaymentCalendarDetails.from(
                                    paymentMetadata.getNotes(),
                                    paymentMetadata.getPatientDetails().getFullName(),
                                    paymentMetadata.getPatientDetails().getProfilePictureUrl(),
                                    reminder.getId(),
                                    paymentMetadata.getAmount(),
                                    paymentMetadata.getPatientDetails().getId(),
                                    reminder.getDate(),
                                    reminder.getTime(),
                                    reminder.getTitle());
                            break;

                        case APPOINTMENT_REMINDER:
                            AppointmentReminderMetadata appointmentMetadata =
                                    (AppointmentReminderMetadata) reminder.getMetadata();
                            calendarResponseTypes = CalendarResponseTypes.APPOINTMENT_REMINDER;
                            details = AppointmentCalendarDetails.from(
                                    appointmentMetadata.getNotes(),
                                    appointmentMetadata.getPatientDetails().getFullName(),
                                    appointmentMetadata.getPatientDetails().getProfilePictureUrl(),
                                    reminder.getId(),
                                    appointmentMetadata.getPatientDetails().getId(),
                                    reminder.getDate(),
                                    reminder.getTime(),
                                    reminder.getTitle());
                            break;

                        case PRODUCTION_ALIGNER_STATUS_PENDING:
                            ProdutionReminderMetadata alignerMetadata =
                                    (ProdutionReminderMetadata) reminder.getMetadata();
                            calendarResponseTypes = CalendarResponseTypes.PRODUCTION_REMINDER;
                            details = ProductionReminderCalendarDetails.from(
                                    alignerMetadata.getNotes(),
                                    alignerMetadata.getPatientDetails().getFullName(),
                                    alignerMetadata.getPatientDetails().getProfilePictureUrl(),
                                    reminder.getId(),
                                    alignerMetadata.getPatientDetails().getId(),
                                    reminder.getDate(),
                                    reminder.getTime(),
                                    reminder.getTitle(),
                                    alignerMetadata.getAlignerJourneyId());
                            break;

                        case GENERAL_REMINDER:
                            GeneralReminderMetadata generalMetadata = (GeneralReminderMetadata) reminder.getMetadata();
                            calendarResponseTypes = CalendarResponseTypes.GENERAL_REMINDER;
                            if (generalMetadata.getPatientDetails() != null) {
                                details = GeneralReminderCalendarDetails.from(
                                        generalMetadata.getNotes(),
                                        generalMetadata.getPatientDetails().getFullName(),
                                        generalMetadata.getPatientDetails().getProfilePictureUrl(),
                                        generalMetadata.getPatientDetails().getId(),
                                        reminder.getDate(),
                                        reminder.getTime(),
                                        reminder.getTitle(),
                                        reminder.getId());
                            } else {
                                details = GeneralReminderCalendarDetails.from(
                                        generalMetadata.getNotes(),
                                        null,
                                        null,
                                        null,
                                        reminder.getDate(),
                                        reminder.getTime(),
                                        reminder.getTitle(),
                                        reminder.getId());
                            }
                            break;

                        case APPOINTMENT:
                            CustomAppointmentReminderMetadata customAppointmentReminderMetadata =
                                    (CustomAppointmentReminderMetadata) reminder.getMetadata();

                            calendarResponseTypes = CalendarResponseTypes.APPOINTMENT;
                            Long bracesJourneyId = null;
                            if (customAppointmentReminderMetadata.getPatientDetails() != null) {
                                bracesJourneyId = finalPatientToBracesJourneyMap.get(customAppointmentReminderMetadata
                                        .getPatientDetails()
                                        .getId());
                            }

                            details = CustomAppointmentCalendarDetails.from(
                                    customAppointmentReminderMetadata.getNotes(),
                                    customAppointmentReminderMetadata
                                            .getPatientDetails()
                                            .getFullName(),
                                    customAppointmentReminderMetadata
                                            .getPatientDetails()
                                            .getProfilePictureUrl(),
                                    customAppointmentReminderMetadata.getStartDate(),
                                    customAppointmentReminderMetadata.getEndDate(),
                                    reminder.getId(),
                                    customAppointmentReminderMetadata.getPatientId(),
                                    customAppointmentReminderMetadata.getPracticeLocationId(),
                                    customAppointmentReminderMetadata.getPracticeLocationName(),
                                    customAppointmentReminderMetadata.getPracticeLocationCity(),
                                    customAppointmentReminderMetadata.getAmount(),
                                    bracesJourneyId,
                                    customAppointmentReminderMetadata.getIsBracesNotesAdded() != null
                                            ? customAppointmentReminderMetadata.getIsBracesNotesAdded()
                                            : false,
                                    customAppointmentReminderMetadata.getAppointmentId());
                            break;

                        case TREATMENT_START_REMINDER:
                            TreatementStartReminderMetadata treatementStartReminderMetadata =
                                    (TreatementStartReminderMetadata) reminder.getMetadata();
                            var patient = finalPatientMap.get(treatementStartReminderMetadata.getPatientId());
                            if (patient == null) {
                                throw new PatientNotFoundException("Patient not found");
                            }
                            calendarResponseTypes = CalendarResponseTypes.TREATMENT_START_REMINDER;
                            details = TreatmentStartDetails.from(
                                    patient.fullName(),
                                    patient.getProfilePictureUrl(),
                                    reminder.getId(),
                                    patient.getId(),
                                    reminder.getDate(),
                                    reminder.getTime(),
                                    reminder.getTitle() != null
                                            ? reminder.getTitle()
                                            : reminder.getPurpose().name());
                            break;

                        case UNPROCESSED_ALIGNER_REMINDER:
                            UnprocessedAlignerReminderMetadata unprocessedAlignerReminderMetadata =
                                    (UnprocessedAlignerReminderMetadata) reminder.getMetadata();
                            var patientForUnprocessedAligner =
                                    finalPatientMap.get(unprocessedAlignerReminderMetadata.getPatientId());
                            if (patientForUnprocessedAligner == null) {
                                throw new PatientNotFoundException("Patient not found");
                            }
                            calendarResponseTypes = CalendarResponseTypes.TREATMENT_START_REMINDER;
                            details = UnprocessedAlignerCalenderDetails.from(
                                    patientForUnprocessedAligner.fullName(),
                                    patientForUnprocessedAligner.getProfilePictureUrl(),
                                    reminder.getId(),
                                    patientForUnprocessedAligner.getId(),
                                    reminder.getDate(),
                                    reminder.getTime(),
                                    reminder.getTitle() != null
                                            ? reminder.getTitle()
                                            : reminder.getPurpose().name(),
                                    unprocessedAlignerReminderMetadata.getTreatmentPlanId());
                            break;
                        default:
                            throw new IllegalStateException("Unexpected value: " + reminder.getPurpose());
                    }

                    return new CalendarReminderResponse(
                            localIdGenerator.getAndIncrement(),
                            reminder.getTitle(),
                            createSafeZonedDateTime(reminder.getDate(), reminder.getTime(), reminder.getZone()),
                            calendarResponseTypes,
                            details);
                })
                .toList();

        List<CalendarReminderResponse> pausedTrackingResponses = pausedTrackings.stream()
                .map(tracking -> {
                    var patient = finalPatientSummaryMap.get(tracking.getPatientId());
                    if (patient == null) {
                        return null;
                    }
                    String firstName = patient.getFirstName();
                    String lastName = patient.getLastName();
                    String fullName = fullName(firstName, lastName);

                    TreatmentPausedCalendarDetails pausedDetails = TreatmentPausedCalendarDetails.from(
                            tracking.getReasonForPausing(),
                            fullName,
                            patient.getProfilePictureUrl(),
                            tracking.getPauseDate(),
                            tracking.getResumeDate(),
                            tracking.getPatientId(),
                            tracking.getAlignerJourneyId());

                    return new CalendarReminderResponse(
                            localIdGenerator.getAndIncrement(),
                            null,
                            tracking.getResumeDate().atTime(10, 0).atZone(TimezoneConfig.DEFAULT_ZONE_ID),
                            CalendarResponseTypes.RESUME_TREATMENT_REMINDER,
                            pausedDetails);
                })
                .filter(Objects::nonNull)
                .toList();

        List<CalendarReminderResponse> alignerActionResponses = alignerActions.stream()
                .map(action -> {
                    var details = (AlignerCheckInMetadata) action.getMetadata();
                    boolean isPhotosUploaded = !details.getAlignerPhotoIds().isEmpty();
                    boolean isFeedbackNeedsReview =
                            !details.getAlignerFeedbackIds().isEmpty();

                    var patient = finalPatientSummaryMap.get(action.getPatientId());
                    if (patient == null) {
                        return null;
                    }
                    String firstName = patient.getFirstName();
                    String lastName = patient.getLastName();
                    String fullName = fullName(firstName, lastName);

                    AlignerCheckInCalendarDetails alignerDetails = AlignerCheckInCalendarDetails.from(
                            fullName,
                            patient.getProfilePictureUrl(),
                            isPhotosUploaded,
                            isFeedbackNeedsReview,
                            action.getJawType(),
                            action.getAlignerNumber(),
                            action.getPatientId(),
                            action.getAlignerActionId(),
                            action.getAlignerJourneyId(),
                            action.getAlignerActionId());

                    return new CalendarReminderResponse(
                            localIdGenerator.getAndIncrement(),
                            null,
                            action.getPerformedAt(),
                            CalendarResponseTypes.ALIGNER_CHECK_IN,
                            alignerDetails);
                })
                .filter(Objects::nonNull)
                .toList();

        List<CalendarReminderResponse> alignerChangeCalendarDetails = alignerChangeDetails.stream()
                .map(aligner -> {
                    String patientName = fullName(aligner.getFirstName(), aligner.getLastName());
                    String profileUrl = aligner.getProfileUrl();
                    JawType previousJawType = aligner.getPreviousJawType();
                    JawType currentJawType = aligner.getCurrentJawType();
                    int previousAlignerNumber =
                            aligner.getPreviousAlignerNumber() != null ? aligner.getPreviousAlignerNumber() : 0;
                    int currentAlignerNumber =
                            aligner.getCurrentAlignerNumber() != null ? aligner.getCurrentAlignerNumber() : 0;

                    LocalDate recommendedDateOfChange = aligner.getEndDate();
                    int daysDelay = aligner.getDaysDelay();

                    boolean isCheckInPerformed = "true".equals(aligner.getCheckInPerformed());
                    boolean isManual = "true".equals(aligner.getManual());

                    LocalDateTime performedAtLocalDateTime = aligner.getPerformedAt();
                    ZonedDateTime performedAtZoned = ZonedDateTime.of(performedAtLocalDateTime, ZoneId.systemDefault());

                    AlignerChangeCalendarDetails alignerDetails = AlignerChangeCalendarDetails.from(
                            patientName,
                            profileUrl,
                            previousJawType,
                            currentJawType,
                            previousAlignerNumber,
                            currentAlignerNumber,
                            recommendedDateOfChange,
                            daysDelay,
                            isCheckInPerformed,
                            isManual,
                            aligner.getPatientId(),
                            aligner.getAlignerJourneyId(),
                            aligner.getActionId());

                    return new CalendarReminderResponse(
                            localIdGenerator.getAndIncrement(),
                            null,
                            performedAtZoned,
                            CalendarResponseTypes.ALIGNER_CHANGED,
                            alignerDetails);
                })
                .toList();

        long afterProcessing = System.currentTimeMillis();
        log.debug(
                "[V3-Performance] Response processing completed in {}ms. Reminders: {}, Trackings: {}, Actions: {}, Changes: {}",
                (afterProcessing - afterPatientFetch),
                reminderResponses.size(),
                pausedTrackingResponses.size(),
                alignerActionResponses.size(),
                alignerChangeCalendarDetails.size());

        int totalSize = reminderResponses.size()
                + pausedTrackingResponses.size()
                + alignerActionResponses.size()
                + alignerChangeCalendarDetails.size();
        List<CalendarReminderResponse> combinedResponses = new ArrayList<>(totalSize);
        combinedResponses.addAll(reminderResponses);
        combinedResponses.addAll(pausedTrackingResponses);
        combinedResponses.addAll(alignerActionResponses);
        combinedResponses.addAll(alignerChangeCalendarDetails);

        idGenerator.set(localIdGenerator.get());

        long endTime = System.currentTimeMillis();
        long totalTime = endTime - startTime;
        log.info(
                "[V3-Performance] TOTAL time: {}ms for {} records. Breakdown - PatientIDs: {}ms, ParallelFetch: {}ms, CollectIDs: {}ms, PatientData: {}ms, Processing: {}ms, Combine: {}ms",
                totalTime,
                combinedResponses.size(),
                (afterPatientIds - startTime),
                (afterParallelFetch - afterPatientIds),
                (afterCollectIds - afterParallelFetch),
                (afterPatientFetch - afterCollectIds),
                (afterProcessing - afterPatientFetch),
                (endTime - afterProcessing));

        return combinedResponses;
    }

    @NonNull
    private static CalendarResponseTypes getCalendarResponseTypes(SubscriptionPlanDTO.PlanName planType) {
        CalendarResponseTypes responseType = CalendarResponseTypes.PLAN;
        if (planType != null) {
            responseType = switch (planType) {
                case STARTER -> CalendarResponseTypes.STARTER_PLAN_EXPIRING;
                case GROWTH -> CalendarResponseTypes.GROWTH_PLAN_EXPIRING;
                case STUDENT -> CalendarResponseTypes.STUDENT_PLAN_EXPIRING;
                case ENTERPRISE -> CalendarResponseTypes.ENTERPRISE_PLAN_EXPIRING;
                case PROFESSIONAL -> CalendarResponseTypes.PROFESSIONAL_PLAN_EXPIRING;
                default -> responseType;
            };
        }
        return responseType;
    }

    public static ZonedDateTime createSafeZonedDateTime(LocalDate date, LocalTime time, ZoneId zone) {
        if (date == null) {
            return null;
        }
        if (time == null) {
            time = LocalTime.MIDNIGHT;
        }
        if (zone == null) {
            zone = ZoneId.systemDefault();
        }
        return ZonedDateTime.of(date, time, zone);
    }

    private String fullName(String firstName, String lastName) {
        String fullName;

        if (lastName != null) {
            fullName = (firstName != null) ? firstName + " " + lastName : lastName;
        } else {
            fullName = (firstName != null) ? firstName : "";
        }
        return fullName;
    }
}
