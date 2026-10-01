package com.dentalstack.patient.feature.timeline.service;

import com.dentalstack.patient.feature.aligner.dto.aligner.*;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.*;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AddAlignerFeedbackRequest;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.action.metadata.AlignerCheckInMetadata;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.exception.aligner.AlignerJourneyNotFoundException;
import com.dentalstack.patient.feature.aligner.exception.aligner.action.AlignerActionNotFoundException;
import com.dentalstack.patient.feature.aligner.repository.AlignerFeedbackRepository;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.repository.AlignerPhotoRepository;
import com.dentalstack.patient.feature.aligner.repository.action.AlignerActionRepository;
import com.dentalstack.patient.feature.appointment.dto.AppointmentReminderUpdate;
import com.dentalstack.patient.feature.appointment.dto.reminder.CustomAppointmentReminderAddedResponse;
import com.dentalstack.patient.feature.appointment.dto.reminder.CustomAppointmentReminderDeletedResponse;
import com.dentalstack.patient.feature.appointment.dto.reminder.CustomAppointmentReminderUpdatedResponse;
import com.dentalstack.patient.feature.doctor.entity.CustomerAccessAndRevoke;
import com.dentalstack.patient.feature.doctor.entity.Organization;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.repository.CustomerAccessAndRevokeRepository;
import com.dentalstack.patient.feature.notification.dto.MessageSentToPatientUpdate;
import com.dentalstack.patient.feature.notification.enums.NotificationType;
import com.dentalstack.patient.feature.patient.dto.MissingAlignerDataFillUpdate;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.patient.service.PatientProfileService;
import com.dentalstack.patient.feature.reminder.dto.ReminderEventUpdate;
import com.dentalstack.patient.feature.timeline.dto.*;
import com.dentalstack.patient.feature.timeline.dto.doctorinvitation.DoctorInvitationReceivedUpdate;
import com.dentalstack.patient.feature.timeline.dto.doctorinvitation.DoctorInvitationRejectedUpdate;
import com.dentalstack.patient.feature.timeline.dto.erp.PatientAddedByPracticeEventUpdate;
import com.dentalstack.patient.feature.timeline.dto.erp.PatientAssignedToPracticeEventUpdate;
import com.dentalstack.patient.feature.timeline.dto.erp.PracticeConnectedEventUpdate;
import com.dentalstack.patient.feature.timeline.dto.laborder.*;
import com.dentalstack.patient.feature.timeline.dto.manufacturing.ManufacturingCompletedEventUpdate;
import com.dentalstack.patient.feature.timeline.dto.manufacturing.ManufacturingDeliveredEventUpdate;
import com.dentalstack.patient.feature.timeline.dto.manufacturing.ManufacturingInTransitEventUpdate;
import com.dentalstack.patient.feature.timeline.dto.manufacturing.ManufacturingStartedEventUpdate;
import com.dentalstack.patient.feature.timeline.dto.order.*;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.exception.EventNotFoundException;
import com.dentalstack.patient.feature.timeline.metadata.RefinementTreatmentEventMetaData;
import com.dentalstack.patient.feature.timeline.metadata.TreatmentPausedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.calendar.CalendarEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.*;
import com.dentalstack.patient.feature.timeline.metadata.event.laborder.ThirdPartyCustomerApproveTreatmentPlanMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.planningcustomer.*;
import com.dentalstack.patient.feature.timeline.metadata.event.planningcustomer.update.*;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.*;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.update.*;
import com.dentalstack.patient.feature.timeline.repository.EventRepository;
import com.dentalstack.patient.feature.tracking.dto.*;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.exception.BadRequestException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ForkJoinPool;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Slf4j
@Service
public class TimelineServiceImpl implements TimelineService {

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final EventRepository eventRepository;
    private final AlignerActionRepository alignerActionRepository;
    private final AlignerFeedbackRepository alignerFeedbackRepository;
    private final AlignerPhotoRepository alignerPhotoRepository;
    private final PatientRepository patientRepository;

    private final PatientProfileService profileService;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final UserProfileRepository userProfileRepository;
    private final CustomerAccessAndRevokeRepository customerAccessAndRevokeRepository;

    public static final Long SYSTEM_USER_ID = 1L;

    @Override
    public List<AlignerChangeUpdate> getAlignerChangeUpdates(Long doctorId, Long alignerJourneyId) {
        List<Patient> patients = new ArrayList<>();
        if (alignerJourneyId == null)
            patients =
                    alignerJourneyRepository
                            .findByDoctorIdAndProgressStatus(doctorId, ProgressStatus.IN_PROGRESS)
                            .stream()
                            .map(AlignerJourney::getPatient)
                            .toList();
        else {
            AlignerJourney alignerJourney = alignerJourneyRepository
                    .findById(alignerJourneyId)
                    .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
            if (alignerJourney.getDoctorId() != doctorId) {
                throw new BadRequestException(
                        String.format("Aligner journey not created by the doctor with id %d", doctorId));
            }
        }

        List<AlignerChangeUpdate> updates = new ArrayList<>();
        for (var patient : patients) {
            updates.addAll(
                    eventRepository
                            .findByUserIdAndUserTypeAndType(patient.getId(), UserType.PATIENT, EventType.ALIGNER_CHANGE)
                            .stream()
                            .map(event -> AlignerChangeUpdate.from(event, patient))
                            .toList());
        }

        log.info("Fetched aligner change updates for all patients of doctor {}", doctorId);
        updates.sort(Comparator.comparing(AlignerChangeUpdate::getEventAt).reversed());
        return updates;
    }

    @Override
    public long getTotalActiveEventCount(long doctorId, UserProfile userProfile) {
        List<EventType> eventTypes = new ArrayList<>(getEventTypeListWithoutTreatmentStarting());

        Set<String> restrictedRoles =
                Set.of(DoctorRole.COMMERCIAL_ALIGNER_LAB.name(), DoctorRole.LAB_STAFF.name(), DoctorRole.VENDOR.name());

        boolean hasRestrictedRole =
                userProfile.getRoles().stream().map(Role::getName).anyMatch(restrictedRoles::contains);

        if (hasRestrictedRole) {
            List<EventType> eventTypesToRemove =
                    Arrays.asList(EventType.PATIENT_CONNECTED_WITH_DOCTOR, EventType.PATIENT_ADDED_BY_PRACTICE);

            eventTypes.removeAll(eventTypesToRemove);
        }

        List<EventType> treatmentStartingEvents =
                List.of(EventType.TREATMENT_STARTING, EventType.TREATMENT_STARTING_TOMORROW);
        List<String> metadataTypes = Arrays.asList("TREATMENT_STARTING", "TREATMENT_STARTING_TOMORROW");

        long countByForUserIdAndForUserType;
        long countByUserIdAndUserTypeAndTypeInAndActiveTrue;
        long countTreatmentStartingEvents;
        var organizationId = userProfile.getOrganization().getId();
        var profileId = userProfile.getId();
        if (UserProfile.isAlignerCompanyOrLab(userProfile.getRoles())
                || UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
            countByForUserIdAndForUserType = eventRepository.countByForUserIdAndForUserTypeAndProfile(
                    doctorId, UserType.DOCTOR, eventTypes, profileId);
            countByUserIdAndUserTypeAndTypeInAndActiveTrue =
                    eventRepository.countByUserIdAndUserTypeAndTypeInAndActiveTrueAndProfile(
                            doctorId, UserType.DOCTOR, eventTypes, profileId);
            countTreatmentStartingEvents = eventRepository.countTreatmentStartingEventsForDoctorAndProfile(
                    doctorId, UserType.DOCTOR, treatmentStartingEvents, metadataTypes, profileId);
        } else {
            countByForUserIdAndForUserType = eventRepository.countByForUserIdAndForUserTypeAndOrg(
                    doctorId, UserType.DOCTOR, eventTypes, organizationId);
            countByUserIdAndUserTypeAndTypeInAndActiveTrue =
                    eventRepository.countByUserIdAndUserTypeAndTypeInAndActiveTrueAndOrg(
                            doctorId, UserType.DOCTOR, eventTypes, organizationId);
            countTreatmentStartingEvents = eventRepository.countTreatmentStartingEventsForDoctorAndOrg(
                    doctorId, UserType.DOCTOR, treatmentStartingEvents, metadataTypes, organizationId);
        }
        return countByForUserIdAndForUserType
                + countByUserIdAndUserTypeAndTypeInAndActiveTrue
                + countTreatmentStartingEvents;
    }

    private List<EventType> getDoctorEventTypes() {
        return Arrays.asList(
                EventType.ALIGNER_CHANGE,
                EventType.MESSAGE_SENT_TO_DOCTOR,
                EventType.MISSED_ALIGNER_CHANGED_DATE,
                EventType.PATIENT_FILLED_MISSING_DATA,
                EventType.ALIGNER_CHANGE_FEEDBACK_ADDED,
                EventType.TREATMENT_STARTING,
                EventType.TREATMENT_STARTING_TOMORROW,
                EventType.PATIENT_CONNECTED_WITH_DOCTOR,
                EventType.ALIGNER_PRODUCTION_ORDER_REMINDER,
                EventType.UPGRADE_PATIENT_TO_MOBILE_APP,
                EventType.RESUME_TREATMENT_REMINDER,
                EventType.CREATE_REFINEMENT_REMINDER,
                EventType.MANUAL_ALIGNER_CHANGE,
                EventType.ALIGNER_CHECK_IN_FOR_DOCTOR,
                EventType.ISSUE_REPORTED,
                EventType.APPOINTMENT_REMINDER,
                EventType.PAYMENT_REMINDER,
                EventType.CALENDAR_REMINDER,
                EventType.PATIENT_ADDED_BY_PRACTICE,
                EventType.PATIENT_ASSIGNED_TO_PRACTICE,
                EventType.PRACTICE_CONNECTED_ORG,
                EventType.NEW_ORDER_ADDED,
                EventType.COMMENT_ADDED_ON_ORDER,
                EventType.DOCTOR_INVITATION_REJECTED,
                EventType.DOCTOR_INVITATION_ACCEPTED,
                EventType.ORG_SEND_TREATMENT_PLAN_FOR_APPROVAL,
                EventType.PLAN_FINALIZED_BY_PRACTICE,
                EventType.ORDER_ON_HOLD,
                EventType.ORDER_CANCELLED,
                EventType.RE_PLAN_TREATMENT,
                EventType.LAB_ADMIN_ASSIGN_ORDER,
                EventType.THIRD_PARTY_CUSTOMER_REQUEST_STL_FILES,
                EventType.THIRD_PARTY_CUSTOMER_REQUEST_RE_PLAN,
                EventType.THIRD_PARTY_CUSTOMER_SEND_CASE,
                EventType.THIRD_PARTY_CUSTOMER_APPROVE_TREATMENT_PLAN,
                EventType.LAB_ADMIN_SEND_TREATMENT_PLAN,
                EventType.LAB_ADMIN_SEND_STL_FILES,
                EventType.DOCTOR_INVITATION_RECEIVED,
                EventType.STL_FILE_APPROVED,
                EventType.MANUFACTURING_STARTED,
                EventType.MANUFACTURING_COMPLETED,
                EventType.MANUFACTURING_IN_TRANSIT,
                EventType.MANUFACTURING_DELIVERED,
                EventType.NEED_MORE_INFO_REQUESTED,
                EventType.UPDATED_FROM_NEED_MORE_INFO_TO_ORDERED,
                EventType.TREATMENT_COMPLETED,
                EventType.CASE_ASSIGNED_TO_YOU,
                EventType.NEW_COMMENT_ADDED,
                EventType.CASE_MOVED_TO_PLANNING,
                EventType.CASE_MOVED_TO_PRODUCTION,
                EventType.MANUFACTURING_COMPLETED,
                EventType.CASE_READY_TO_BEGIN_TREATMENT,
                EventType.STATUS_UPDATED,
                EventType.RECORDS_ADDED,
                EventType.PRESCRIPTION_ADDED,
                EventType.PLANNING_CASE_COMPLETED,
                EventType.PLANNING_CUSTOMER_PATIENT_ONBOARDED,
                EventType.PLANNING_CUSTOMER_LAB_UPLOADED_STL_FILES,
                EventType.PLANNING_CUSTOMER_CASE_COMPLETED,
                EventType.PLANNING_CUSTOMER_TREATMENT_PLAN_APPROVED,
                EventType.PLANNING_CUSTOMER_TREATMENT_PLAN_REVISION,
                EventType.PLANNING_CUSTOMER_TREATMENT_PLAN_SENT_FOR_APPROVAL,
                EventType.PLANNING_CUSTOMER_NEED_MORE_INFO_REQUESTED,
                EventType.NEW_MESSAGE,
                EventType.VSP_CASE_ASSIGNED,
                EventType.VSP_CASE_SUBMITTED,
                EventType.VSP_FILES_UPLOADED,
                EventType.VSP_PLAN_READY_FOR_REVIEW,
                EventType.VSP_PLAN_APPROVED,
                EventType.VSP_REVISION_REQUESTED,
                EventType.VSP_MORE_INFORMATION_REQUIRED,
                EventType.VSP_PLANNING_COMPLETED,
                EventType.VSP_PRODUCTION_ORDER_CREATED,
                EventType.VSP_ORDER_SHIPPED,
                EventType.VSP_ORDER_DELIVERED,
                EventType.VSP_NEW_MESSAGE_LAB_TO_CUSTOMER,
                EventType.VSP_NEW_MESSAGE_CUSTOMER_TO_LAB);
    }

    private List<EventType> getEventTypeListWithoutTreatmentStarting() {
        return Arrays.asList(
                EventType.ALIGNER_CHANGE,
                EventType.MESSAGE_SENT_TO_DOCTOR,
                EventType.MISSED_ALIGNER_CHANGED_DATE,
                EventType.PATIENT_FILLED_MISSING_DATA,
                EventType.ALIGNER_CHANGE_FEEDBACK_ADDED,
                EventType.PATIENT_CONNECTED_WITH_DOCTOR,
                EventType.ALIGNER_PRODUCTION_ORDER_REMINDER,
                EventType.UPGRADE_PATIENT_TO_MOBILE_APP,
                EventType.RESUME_TREATMENT_REMINDER,
                EventType.CREATE_REFINEMENT_REMINDER,
                EventType.MANUAL_ALIGNER_CHANGE,
                EventType.ALIGNER_CHECK_IN_FOR_DOCTOR,
                EventType.ISSUE_REPORTED,
                EventType.APPOINTMENT_REMINDER,
                EventType.PAYMENT_REMINDER,
                EventType.CALENDAR_REMINDER,
                EventType.PATIENT_ADDED_BY_PRACTICE,
                EventType.PATIENT_ASSIGNED_TO_PRACTICE,
                EventType.PRACTICE_CONNECTED_ORG,
                EventType.NEW_ORDER_ADDED,
                EventType.COMMENT_ADDED_ON_ORDER,
                EventType.DOCTOR_INVITATION_REJECTED,
                EventType.DOCTOR_INVITATION_ACCEPTED,
                EventType.ORG_SEND_TREATMENT_PLAN_FOR_APPROVAL,
                EventType.PLAN_FINALIZED_BY_PRACTICE,
                EventType.ORDER_ON_HOLD,
                EventType.ORDER_CANCELLED,
                EventType.RE_PLAN_TREATMENT,
                EventType.LAB_ADMIN_ASSIGN_ORDER,
                EventType.THIRD_PARTY_CUSTOMER_REQUEST_STL_FILES,
                EventType.THIRD_PARTY_CUSTOMER_REQUEST_RE_PLAN,
                EventType.THIRD_PARTY_CUSTOMER_SEND_CASE,
                EventType.THIRD_PARTY_CUSTOMER_APPROVE_TREATMENT_PLAN,
                EventType.LAB_ADMIN_SEND_TREATMENT_PLAN,
                EventType.LAB_ADMIN_SEND_STL_FILES,
                EventType.DOCTOR_INVITATION_RECEIVED,
                EventType.STL_FILE_APPROVED,
                EventType.MANUFACTURING_STARTED,
                EventType.MANUFACTURING_COMPLETED,
                EventType.MANUFACTURING_IN_TRANSIT,
                EventType.MANUFACTURING_DELIVERED,
                EventType.NEED_MORE_INFO_REQUESTED,
                EventType.UPDATED_FROM_NEED_MORE_INFO_TO_ORDERED,
                EventType.TREATMENT_COMPLETED,
                EventType.CASE_ASSIGNED_TO_YOU,
                EventType.NEW_COMMENT_ADDED,
                EventType.CASE_MOVED_TO_PLANNING,
                EventType.CASE_MOVED_TO_PRODUCTION,
                EventType.MANUFACTURING_COMPLETED,
                EventType.CASE_READY_TO_BEGIN_TREATMENT,
                EventType.STATUS_UPDATED,
                EventType.RECORDS_ADDED,
                EventType.PRESCRIPTION_ADDED,
                EventType.PLANNING_CASE_COMPLETED,
                EventType.PLANNING_CUSTOMER_PATIENT_ONBOARDED,
                EventType.PLANNING_CUSTOMER_LAB_UPLOADED_STL_FILES,
                EventType.PLANNING_CUSTOMER_CASE_COMPLETED,
                EventType.PLANNING_CUSTOMER_TREATMENT_PLAN_APPROVED,
                EventType.PLANNING_CUSTOMER_TREATMENT_PLAN_REVISION,
                EventType.PLANNING_CUSTOMER_TREATMENT_PLAN_SENT_FOR_APPROVAL,
                EventType.PLANNING_CUSTOMER_NEED_MORE_INFO_REQUESTED,
                EventType.NEW_MESSAGE,
                EventType.VSP_CASE_ASSIGNED,
                EventType.VSP_CASE_SUBMITTED,
                EventType.VSP_FILES_UPLOADED,
                EventType.VSP_PLAN_READY_FOR_REVIEW,
                EventType.VSP_PLAN_APPROVED,
                EventType.VSP_REVISION_REQUESTED,
                EventType.VSP_MORE_INFORMATION_REQUIRED,
                EventType.VSP_PLANNING_COMPLETED,
                EventType.VSP_PRODUCTION_ORDER_CREATED,
                EventType.VSP_ORDER_SHIPPED,
                EventType.VSP_ORDER_DELIVERED,
                EventType.VSP_NEW_MESSAGE_LAB_TO_CUSTOMER,
                EventType.VSP_NEW_MESSAGE_CUSTOMER_TO_LAB);
    }

    @Override
    public long getTotalAlignerEventActiveCount(long doctorId, UserProfile userProfile) {
        List<EventType> eventTypes = List.of(EventType.ALIGNER_CHANGE);

        long countByForUserIdAndForUserType;
        long countByUserIdAndUserTypeAndTypeInAndActiveTrue;

        var organizationId = userProfile.getOrganization().getId();
        var profileId = userProfile.getId();

        if (UserProfile.isAlignerCompanyOrLab(userProfile.getRoles())
                || UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
            countByForUserIdAndForUserType = eventRepository.countByForUserIdAndForUserTypeAndProfile(
                    doctorId, UserType.DOCTOR, eventTypes, profileId);
            countByUserIdAndUserTypeAndTypeInAndActiveTrue =
                    eventRepository.countByUserIdAndUserTypeAndTypeInAndActiveTrueAndProfile(
                            doctorId, UserType.DOCTOR, eventTypes, profileId);
        } else {
            countByForUserIdAndForUserType = eventRepository.countByForUserIdAndForUserTypeAndOrg(
                    doctorId, UserType.DOCTOR, eventTypes, organizationId);
            countByUserIdAndUserTypeAndTypeInAndActiveTrue =
                    eventRepository.countByUserIdAndUserTypeAndTypeInAndActiveTrueAndOrg(
                            doctorId, UserType.DOCTOR, eventTypes, organizationId);
        }
        return countByForUserIdAndForUserType + countByUserIdAndUserTypeAndTypeInAndActiveTrue;
    }

    public long getUnReadNotificationCount(long doctorId, long organizationId) {
        List<EventType> treatmentStartingEvents =
                List.of(EventType.TREATMENT_STARTING, EventType.TREATMENT_STARTING_TOMORROW);
        List<EventType> eventTypes = getEventTypeListWithoutTreatmentStarting();

        List<String> metadataTypes = Arrays.asList("TREATMENT_STARTING", "TREATMENT_STARTING_TOMORROW");
        long countByForUserIdAndForUserType =
                eventRepository.countByUserIdAndUserTypeAndTypeInAndReadFalseAndActiveTrueAndOrganizationId(
                        doctorId, UserType.DOCTOR, eventTypes, organizationId);

        long countTreatmentStartingEvents = eventRepository.countTreatmentStartingEventsForDoctorAndOrganizationId(
                doctorId, UserType.DOCTOR, treatmentStartingEvents, metadataTypes, organizationId);

        long countByUserIdAndUserTypeAndTypeInAndActiveTrue =
                eventRepository.countByForUserIdAndForUserTypeAndIsReadAndOrganizationId(
                        doctorId, UserType.DOCTOR, eventTypes, organizationId);
        return countByForUserIdAndForUserType
                + countByUserIdAndUserTypeAndTypeInAndActiveTrue
                + countTreatmentStartingEvents;
    }

    @Transactional(readOnly = true)
    @Override
    public AllUpdates getAllUpdates(
            Long doctorId,
            Long patientId,
            Boolean active,
            Set<EventType> allowedEventTypes,
            int page,
            int size,
            Long profileId,
            Long organizationId) {
        List<Update> updates = new ArrayList<>();
        Page<Event> eventsByDoctor;
        Page<Event> eventsForDoctor;

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "eventTime"));

        List<EventType> eventTypes = new ArrayList<>(getDoctorEventTypes());
        if (allowedEventTypes != null && allowedEventTypes.contains(EventType.ALL)) {
            eventTypes = getDoctorEventTypes();
        } else {
            if (allowedEventTypes != null && !allowedEventTypes.isEmpty()) {
                eventTypes = new ArrayList<>(allowedEventTypes);
            }
        }
        Set<String> restrictedRoles =
                Set.of(DoctorRole.COMMERCIAL_ALIGNER_LAB.name(), DoctorRole.LAB_STAFF.name(), DoctorRole.VENDOR.name());

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(profileId);
        Long finalProfileId = profileId;
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(finalProfileId));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            profileId = userProfile.getId();
            doctorId = userProfile.getDoctor().getId();
        }

        boolean hasRestrictedRole =
                userProfile.getRoles().stream().map(Role::getName).anyMatch(restrictedRoles::contains);

        if (hasRestrictedRole) {
            List<EventType> eventTypesToRemove =
                    Arrays.asList(EventType.PATIENT_CONNECTED_WITH_DOCTOR, EventType.PATIENT_ADDED_BY_PRACTICE);
            eventTypes.removeAll(eventTypesToRemove);
        }

        if (adminWithDefaultTag) {
            eventTypes.remove(EventType.PATIENT_ADDED_BY_PRACTICE);
        }
        eventsByDoctor = eventRepository.findPageByUserIdAndUserTypeAndActiveWithEventTypesForProfile(
                UserType.DOCTOR, true, eventTypes, profileId, pageable);
        eventsForDoctor = eventRepository.findPageByForUserIdAndForUserTypeAndActiveWithEventTypesAndProfile(
                UserType.DOCTOR, true, eventTypes, profileId, pageable);

        long totalActiveEventCount = getTotalActiveEventCount(doctorId, userProfile);
        long totalAlignerEventActiveCount = getTotalAlignerEventActiveCount(doctorId, userProfile);

        eventsByDoctor.stream()
                .filter(event -> allowedEventTypes == null
                        || allowedEventTypes.isEmpty()
                        || allowedEventTypes.contains(event.getType()))
                .forEach(event -> {
                    var forPatient = profileService.getPatientForTimeline(event.getForUserId());

                    switch (event.getType()) {
                        case TREATMENT_SETUP -> {
                            TreatmentSetupEventMetadata metadata = (TreatmentSetupEventMetadata) event.getMetadata();
                            var currentPatientId =
                                    metadata.getAlignerJourneyDetails().getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(TreatmentSetupUpdate.from(event, patient)));
                        }

                        case DOCTOR_INVITATION_ACCEPTED -> {
                            if (!adminWithDefaultTag) {
                                updates.add(DoctorInvitationAcceptedUpdate.from(event));
                            }
                        }

                        case TREATMENT_STARTING_TOMORROW -> {
                            TreatmentStartingTomorrowEventMetadata metadata =
                                    (TreatmentStartingTomorrowEventMetadata) event.getMetadata();
                            var currentPatientId =
                                    metadata.getAlignerJourneyDetails().getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            LocalDate firstAlignerStartDate =
                                    metadata.getAlignerJourneyDetails().getFirstAlignerStartDate();
                            LocalDate today = LocalDate.now();
                            LocalDate tomorrow = today.plusDays(1);

                            if (firstAlignerStartDate.equals(today) || firstAlignerStartDate.equals(tomorrow)) {
                                profileService
                                        .getPatientForTimeline(currentPatientId)
                                        .ifPresent(patient ->
                                                updates.add(TreatmentStartingTomorrowUpdate.from(event, patient)));
                            }
                        }
                        case ALIGNER_PRODUCTION_ORDER_REMINDER -> {
                            var metadata = (AlignerProductionOrderReminderEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getAlignerJourney().getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(
                                            patient -> updates.add(AlignerProductionOrderReminderUpdate.from(event)));
                        }

                        case TREATMENT_PAUSED -> {
                            var metadata = (TreatmentPausedEventMetadata) event.getMetadata();
                            var currentPatientId =
                                    metadata.getAlignerJourneyDetails().getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(TreatmentPausedUpdate.from(event, patient)));
                        }

                        case TREATMENT_RESUMED -> {
                            var metadata = (TreatmentResumedEventMetadata) event.getMetadata();
                            var currentPatientId =
                                    metadata.getAlignerJourneyDetails().getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(TreatmentResumedUpdate.from(event, patient)));
                        }

                        case TREATMENT_COMPLETED -> {
                            var metadata = (TreatmentCompletedEventMetadata) event.getMetadata();
                            var currentPatientId =
                                    metadata.getTreatmentCompleted().getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(TreatmentCompletedMetadataUpdate.from(event, patient)));
                        }

                        case CASE_ASSIGNED_TO_YOU -> {
                            var metadata = (CaseAssignedToYouEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(CaseAssignedToYouMetadataUpdate.from(event, patient)));
                        }

                        case NEW_COMMENT_ADDED -> {
                            var metadata = (NewCommentAddedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(
                                            patient -> updates.add(NewCommentAddedMetadataUpdate.from(event, patient)));
                        }

                        case CASE_MOVED_TO_PLANNING -> {
                            var metadata = (CaseMovedToPlanningEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(CaseMovedToPlanningMetadataUpdate.from(event, patient)));
                        }

                        case CASE_MOVED_TO_PRODUCTION -> {
                            var metadata = (CaseMovedToProductionEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(CaseMovedToProductionMetadataUpdate.from(event, patient)));
                        }

                        case CASE_READY_TO_BEGIN_TREATMENT -> {
                            var metadata = (CaseReadyToBeginTreatmentEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(CaseReadyToBeginTreatmentMetadataUpdate.from(event, patient)));
                        }

                        case STATUS_UPDATED -> {
                            var metadata = (StatusUpdatedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(
                                            patient -> updates.add(StatusUpdatedMetadataUpdate.from(event, patient)));
                        }

                        case PRESCRIPTION_ADDED -> {
                            var metadata = (PrescriptionAddedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(PrescriptionAddedMetadataUpdate.from(event, patient)));
                        }

                        case PLANNING_CASE_COMPLETED -> {
                            var metadata = (PlanningCaseCompletedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(PlanningCaseCompletedMetadataUpdate.from(event, patient)));
                        }

                        case PLANNING_CUSTOMER_PATIENT_ONBOARDED -> {
                            var metadata = (PlanningCustomerPatientOnboardMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(
                                            PlanningCustomerPatientOnboardMetadataUpdate.from(event, patient)));
                        }

                        case PLANNING_CUSTOMER_LAB_UPLOADED_STL_FILES -> {
                            var metadata = (PlanningCustomerLabUploadedStlFilesMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(
                                            PlanningCustomerLabUploadedStlFilesMetadataUpdate.from(event, patient)));
                        }

                        case PLANNING_CUSTOMER_CASE_COMPLETED -> {
                            var metadata = (PlanningCustomerCaseCompletedMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(
                                            PlanningCustomerCaseCompletedMetadataUpdate.from(event, patient)));
                        }

                        case PLANNING_CUSTOMER_TREATMENT_PLAN_APPROVED -> {
                            var metadata = (PlanningCustomerTreatmentPlanApprovedMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(
                                            PlanningCustomerTreatmentPlanApprovedMetadataUpdate.from(event, patient)));
                        }

                        case PLANNING_CUSTOMER_TREATMENT_PLAN_REVISION -> {
                            var metadata = (PlanningCustomerTreatmentPlanRevisionMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(
                                            PlanningCustomerTreatmentPlanRevisionMetadataUpdate.from(event, patient)));
                        }

                        case PLANNING_CUSTOMER_TREATMENT_PLAN_SENT_FOR_APPROVAL -> {
                            var metadata = (PlanningCustomerTreatmentPlanSendForApprovalMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(PlanningCustomerTreatmentPlanSendForApprovalMetadataUpdate.from(
                                                    event, patient)));
                        }

                        case PLANNING_CUSTOMER_NEED_MORE_INFO_REQUESTED -> {
                            var metadata = (PlanningCustomerNeedMoreInfoRequestedMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(
                                            PlanningCustomerNeedMoreInfoRequestedMetadataUpdate.from(event, patient)));
                        }
                        case NEW_MESSAGE -> {
                            var metadata = (PlanningCustomerNewMessageMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(PlanningCustomerNewMessageMetadataUpdate.from(event, patient)));
                        }

                        case VSP_CASE_ASSIGNED -> {
                            var metadata = (VspCaseAssignedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(VspCaseAssignedEventMetadataUpdate.from(event, patient)));
                        }

                        case VSP_CASE_SUBMITTED -> {
                            var metadata = (VspCaseSubmitEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(VspCaseSubmitEventMetadataUpdate.from(event, patient)));
                        }

                        case VSP_FILES_UPLOADED -> {
                            var metadata = (VspFileUploadedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(VspFileUploadedEventMetadataUpdate.from(event, patient)));
                        }

                        case VSP_PLAN_READY_FOR_REVIEW -> {
                            var metadata = (VspPlanReadyForReviewEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(VspPlanReadyForReviewEventMetadataUpdate.from(event, patient)));
                        }

                        case VSP_PLAN_APPROVED -> {
                            var metadata = (VspPlanApprovedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(VspPlanApprovedEventMetadataUpdate.from(event, patient)));
                        }

                        case VSP_REVISION_REQUESTED -> {
                            var metadata = (VspRevisionRequestedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(VspRevisionRequestedEventMetadataUpdate.from(event, patient)));
                        }

                        case VSP_MORE_INFORMATION_REQUIRED -> {
                            var metadata = (VspMoreInfoRequiredEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(VspMoreInfoRequiredEventMetadataUpdate.from(event, patient)));
                        }

                        case VSP_PLANNING_COMPLETED -> {
                            var metadata = (VspPlanningCompletedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(VspPlanningCompletedEventMetadataUpdate.from(event, patient)));
                        }

                        case VSP_PRODUCTION_ORDER_CREATED -> {
                            var metadata = (VspProductionOrderCreatedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(
                                            VspProductionOrderCreatedEventMetadataUpdate.from(event, patient)));
                        }

                        case VSP_ORDER_SHIPPED -> {
                            var metadata = (VspOrderShippedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(VspOrderShippedEventMetadataUpdate.from(event, patient)));
                        }

                        case VSP_ORDER_DELIVERED -> {
                            var metadata = (VspOrderDeliveredEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient ->
                                            updates.add(VspOrderDeliveredEventMetadataUpdate.from(event, patient)));
                        }

                        case VSP_NEW_MESSAGE_LAB_TO_CUSTOMER -> {
                            var metadata = (VspNewMessageLabToCustomerEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(
                                            VspNewMessageLabToCustomerEventMetadataUpdate.from(event, patient)));
                        }

                        case VSP_NEW_MESSAGE_CUSTOMER_TO_LAB -> {
                            var metadata = (VspNewMessageCustomerToLabEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(
                                            VspNewMessageCustomerToLabEventMetadataUpdate.from(event, patient)));
                        }

                        case TREATMENT_DEACTIVATED -> {
                            var metadata = (TreatmentDeactivatedEventMetaData) event.getMetadata();
                            var currentPatientId =
                                    metadata.getAlignerJourneyDetails().getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(TreatmentDeactivatedUpdate.from(event, patient)));
                        }

                        case FORCE_ALIGNER_CHANGE -> {
                            if (forPatient.isPresent()) {
                                if (patientId != null
                                        && Objects.equals(forPatient.get().getId(), patientId)) {
                                    updates.add(ForceAlignerChangeUpdate.from(event, forPatient.get()));
                                }
                            }
                        }

                        case REFINEMENT_TREATMENT -> {
                            var metadata = (RefinementTreatmentEventMetaData) event.getMetadata();
                            var currentPatientId =
                                    metadata.getAlignerJourneyDetails().getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(RefinementTreatmentUpdate.from(event, patient)));
                        }

                        case ALIGNER_CHECK_IN -> {
                            var metadata = (AlignerCheckInEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> {
                                        var action = alignerActionRepository
                                                .findById(metadata.getAlignerActionId())
                                                .orElseThrow(() -> new AlignerActionNotFoundException(
                                                        metadata.getAlignerActionId()));
                                        var checkInDetails = (AlignerCheckInMetadata) action.getMetadata();
                                        var feedbacks = alignerFeedbackRepository.findAllById(
                                                checkInDetails.getAlignerFeedbackIds());
                                        var photos =
                                                alignerPhotoRepository.findAllById(checkInDetails.getAlignerPhotoIds());
                                        updates.add(
                                                AlignerCheckInUpdate.from(event, patient, action, feedbacks, photos));
                                    });
                        }

                        case ALIGNER_CHECK_IN_FOR_DOCTOR -> {
                            var metadata = (AlignerCheckInForDoctorEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> {
                                        var action = alignerActionRepository
                                                .findById(metadata.getAlignerActionId())
                                                .orElseThrow(() -> new AlignerActionNotFoundException(
                                                        metadata.getAlignerActionId()));
                                        var checkInDetails = (AlignerCheckInMetadata) action.getMetadata();
                                        var feedbacks = alignerFeedbackRepository.findAllById(
                                                checkInDetails.getAlignerFeedbackIds());
                                        var photos =
                                                alignerPhotoRepository.findAllById(checkInDetails.getAlignerPhotoIds());
                                        updates.add(AlignerCheckInForDoctorUpdate.from(
                                                event, patient, action, feedbacks, photos));
                                    });
                        }

                        case ISSUE_REPORTED -> {
                            var metadata = (AlignerIssueEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(AlignerIssueUpdate.from(event, patient)));
                        }

                        case WEAR_DAYS_UPDATED -> {
                            var metadata = (WearDaysUpdateEventMetaData) event.getMetadata();
                            var currentPatientId =
                                    metadata.getAlignerJourneyDetails().getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(WearDaysUpdate.from(event, patient)));
                        }

                        case ALIGNER_CHANGE_FEEDBACK_ADDED_BY_DOCTOR -> {
                            var metadata = (AlignerChangeFeedbackAddedByPatientEventMetadata) event.getMetadata();
                            var currentPatientId =
                                    metadata.getAlignerJourneyDetails().getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(
                                            AlignerChangeFeedbackAddedByPatientUpdate.from(event, patient)));
                        }

                        case ALIGNER_CHANGE_VALIDATED -> {
                            var metadata = (AlignerChangeValidatedEventEventMetadata) event.getMetadata();
                            var currentPatientId =
                                    metadata.getAlignerJourneyDetails().getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(
                                            patient -> updates.add(AlignerChangeValidatedUpdate.from(event, patient)));
                        }

                        case REMINDER -> {
                            var metadata = (ReminderEventMetaData) event.getMetadata();
                            var currentPatientId =
                                    metadata.getAlignerJourneyDetails().getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(patient -> updates.add(ReminderEventUpdate.from(event, patient)));
                        }

                        case MESSAGE_SENT_TO_PATIENT -> {
                            var metadata = (MessageSentToPatientEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientDetails().getId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            updates.add(MessageSentToPatientUpdate.from(event));
                        }

                        case UPCOMING_ALIGNER_CHANGE -> {
                            var metadata = (UpcomingAlignerChangeEventMetaData) event.getMetadata();
                            var currentPatientId =
                                    metadata.getAlignerJourneyDetails().getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(
                                            patient -> updates.add(UpcomingAlignerChangeUpdate.from(event, patient)));
                        }

                        case CALENDAR_REMINDER -> {
                            var metadata = (CalendarEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientId();
                            if (patientId != null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(currentPatientId)
                                    .ifPresent(p -> updates.add(CalendarEventUpdate.from(event, p)));
                        }
                        case PATIENT_APPOINTMENT_REMINDER_ADDED -> {
                            CustomAppointmentReminderAddedEventMetadata metadata =
                                    (CustomAppointmentReminderAddedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientDetails().getId();
                            if (patientId == null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(
                                            metadata.getPatientDetails().getId())
                                    .ifPresent(p -> updates.add(CustomAppointmentReminderAddedResponse.from(
                                            event, p, metadata.getAppointmentId())));
                        }
                        case PATIENT_APPOINTMENT_REMINDER_UPDATED -> {
                            CustomAppointmentReminderUpdatedEventMetadata metadata =
                                    (CustomAppointmentReminderUpdatedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientDetails().getId();
                            if (patientId == null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(
                                            metadata.getPatientDetails().getId())
                                    .ifPresent(p -> updates.add(CustomAppointmentReminderUpdatedResponse.from(
                                            event, p, metadata.getAppointmentId())));
                        }
                        case PATIENT_APPOINTMENT_REMINDER_DELETED -> {
                            CustomAppointmentReminderDeletedEventMetadata metadata =
                                    (CustomAppointmentReminderDeletedEventMetadata) event.getMetadata();
                            var currentPatientId = metadata.getPatientDetails().getId();
                            if (patientId == null && !currentPatientId.equals(patientId)) {
                                return;
                            }
                            profileService
                                    .getPatientForTimeline(
                                            metadata.getPatientDetails().getId())
                                    .ifPresent(p -> updates.add(CustomAppointmentReminderDeletedResponse.from(
                                            event, p, metadata.getAppointmentId())));
                        }
                    }
                });

        eventsForDoctor.stream()
                .filter(event -> allowedEventTypes == null
                        || allowedEventTypes.isEmpty()
                        || allowedEventTypes.contains(event.getType()))
                .filter(event -> event.getUserType().equals(UserType.PATIENT))
                .filter(event -> {
                    if (patientId != null) {
                        return event.getUserId().equals(patientId);
                    }
                    return true;
                })
                .forEach(event -> {
                    Optional<Patient> optionalPatient = profileService.getPatientForTimeline(event.getUserId());
                    optionalPatient.ifPresent(patient -> {
                        switch (event.getType()) {
                            case ALIGNER_CHANGE -> updates.add(AlignerChangeUpdate.from(event, patient));
                            case PATIENT_CONNECTED_WITH_DOCTOR -> {
                                List<AlignerJourney> alignerJourneys =
                                        alignerJourneyRepository.findByPatientId(patient.getId());
                                var alignerJourney = alignerJourneys.stream()
                                        .filter(journey ->
                                                journey.getPatient().getId().equals(patient.getId()))
                                        .findFirst();
                                long alignerJourneyId = alignerJourney
                                        .map(AlignerJourney::getId)
                                        .orElse(0L);
                                updates.add(PatientInvitationAcceptedUpdate.from(event, alignerJourneyId));
                            }
                            case MISSED_ALIGNER_CHANGED_DATE -> updates.add(
                                    MissedAlignerChangeDateUpdate.from(event, patient));
                            case PATIENT_INVITATION_DECLINED -> updates.add(
                                    PatientInvitationDeclinedUpdate.from(event));
                            case NOT_WEARING_FOR_RECOMMENDED_HOURS -> updates.add(
                                    NotWearingForRecommendedHoursUpdate.from(event, patient));
                            case MESSAGE_SENT_TO_DOCTOR -> updates.add(MessageSentToDoctorUpdate.from(event));
                            case TREATMENT_STARTING -> {
                                TreatmentStartingUpdate update = TreatmentStartingUpdate.from(event, patient);
                                if (update != null) {
                                    updates.add(update);
                                }
                            }
                            case PHOTOS_UPLOADED -> updates.add(PhotosUploadedUpdate.from(event, patient));
                            case TREATMENT_CREATION_COMPLETE -> updates.add(
                                    TreatmentCreationCompleteUpdate.from(event, patient));
                            case ALIGNER_CHANGE_FEEDBACK_ADDED -> updates.add(
                                    AlignerChangeFeedbackAddedUpdate.from(event, patient));
                            case TREATMENT_STARTING_TOMORROW -> updates.add(
                                    (TreatmentStartingTomorrowUpdate.from(event, patient)));
                            case TREATMENT_PAUSED -> updates.add((TreatmentPausedUpdate.from(event, patient)));
                            case TREATMENT_RESUMED -> updates.add((TreatmentResumedUpdate.from(event, patient)));
                            case TREATMENT_DEACTIVATED -> updates.add(
                                    (TreatmentDeactivatedUpdate.from(event, patient)));
                            case REFINEMENT_TREATMENT -> updates.add((RefinementTreatmentUpdate.from(event, patient)));
                            case WEAR_DAYS_UPDATED -> updates.add(WearDaysUpdate.from(event, patient));
                            case ALIGNER_CHANGE_FEEDBACK_ADDED_BY_DOCTOR -> updates.add(
                                    AlignerChangeFeedbackAddedByPatientUpdate.from(event, patient));
                            case ALIGNER_CHANGE_VALIDATED -> updates.add(
                                    AlignerChangeValidatedUpdate.from(event, patient));
                            case REMINDER -> updates.add(ReminderEventUpdate.from(event, patient));
                            case MESSAGE_SENT_TO_PATIENT -> updates.add(MessageSentToPatientUpdate.from(event));
                            case UPCOMING_ALIGNER_CHANGE -> updates.add(
                                    UpcomingAlignerChangeUpdate.from(event, patient));
                            case UPGRADE_PATIENT_TO_MOBILE_APP -> updates.add(
                                    UpgradePatientToMobileAppUpdate.from(event, patient));
                            case RESUME_TREATMENT_REMINDER -> updates.add(
                                    ResumeTreatmentReminderUpdate.from(event, patient));
                            case ALIGNER_CHECK_IN -> {
                                var metadata = (AlignerCheckInEventMetadata) event.getMetadata();
                                Long currentPatientId = metadata.getPatientId();
                                if (patientId != null && !currentPatientId.equals(patientId)) {
                                    return;
                                }
                                var action = alignerActionRepository
                                        .findById(metadata.getAlignerActionId())
                                        .orElseThrow(() ->
                                                new AlignerActionNotFoundException(metadata.getAlignerActionId()));
                                var checkInDetails = (AlignerCheckInMetadata) action.getMetadata();
                                var feedbacks =
                                        alignerFeedbackRepository.findAllById(checkInDetails.getAlignerFeedbackIds());
                                var photos = alignerPhotoRepository.findAllById(checkInDetails.getAlignerPhotoIds());

                                updates.add((AlignerCheckInUpdate.from(event, patient, action, feedbacks, photos)));
                            }
                            case ALIGNER_CHECK_IN_FOR_DOCTOR -> {
                                var metadata = (AlignerCheckInForDoctorEventMetadata) event.getMetadata();
                                Long currentPatientId = metadata.getPatientId();
                                if (patientId != null && !currentPatientId.equals(patientId)) {
                                    return;
                                }
                                var action = alignerActionRepository
                                        .findById(metadata.getAlignerActionId())
                                        .orElseThrow(() ->
                                                new AlignerActionNotFoundException(metadata.getAlignerActionId()));
                                var checkInDetails = (AlignerCheckInMetadata) action.getMetadata();
                                var feedbacks =
                                        alignerFeedbackRepository.findAllById(checkInDetails.getAlignerFeedbackIds());
                                var photos = alignerPhotoRepository.findAllById(checkInDetails.getAlignerPhotoIds());

                                updates.add((AlignerCheckInForDoctorUpdate.from(
                                        event, patient, action, feedbacks, photos)));
                            }
                            case ISSUE_REPORTED -> updates.add((AlignerIssueUpdate.from(event, patient)));
                            case APPOINTMENT_REMINDER -> updates.add((AppointmentReminderUpdate.from(event, patient)));
                            case CREATE_REFINEMENT_REMINDER -> updates.add(
                                    (CreateRefinementTreatmentUpdate.from(event, patient)));
                            case PAYMENT_REMINDER -> updates.add((PaymentReminderUpdate.from(event, patient)));
                            case MANUAL_ALIGNER_CHANGE -> updates.add((ManualAlignerChangeUpdate.from(event, patient)));
                            case ALIGNER_PRODUCTION_ORDER_REMINDER -> updates.add(
                                    AlignerProductionOrderReminderUpdate.from(event));
                            case PATIENT_FILLED_MISSING_DATA -> updates.add(
                                    (MissingAlignerDataFillUpdate.from(event, patient)));

                            case CALENDAR_REMINDER -> updates.add((CalendarEventUpdate.from(event, patient)));
                            case NEW_ORDER_ADDED -> updates.add((NewOrderAddedEventUpdate.from(event, patient)));
                            case COMMENT_ADDED_ON_ORDER -> updates.add(
                                    (NewCommentAddedOnOrderEventUpdate.from(event, patient)));
                            case ORG_SEND_TREATMENT_PLAN_FOR_APPROVAL -> updates.add(
                                    (TreatmentPlanSentForApprovalByOrgEventUpdate.from(event, patient)));

                            case PLAN_FINALIZED_BY_PRACTICE -> updates.add(
                                    (TreatmentPlanFinalisedEventUpdate.from(event, patient)));

                            case ORDER_ON_HOLD -> updates.add((OrderOnHoldEventUpdate.from(event, patient)));
                            case ORDER_CANCELLED -> updates.add((OrderCancelledEventUpdate.from(event, patient)));

                            case RE_PLAN_TREATMENT -> updates.add((ReplanTreamentEventUpdate.from(event, patient)));
                            case PRACTICE_CONNECTED_ORG -> {
                                if (!adminWithDefaultTag) {
                                    updates.add((PracticeConnectedEventUpdate.from(event, patient)));
                                }
                            }
                            case PATIENT_ADDED_BY_PRACTICE -> updates.add(
                                    (PatientAddedByPracticeEventUpdate.from(event, patient)));
                            case LAB_ADMIN_ASSIGN_ORDER -> updates.add(
                                    (LabAdminAssignTheOrdedUpdate.from(event, patient)));
                            case LAB_ADMIN_SEND_TREATMENT_PLAN -> updates.add(
                                    (LabAdminSendTreatmentPlanUpdate.from(event, patient)));
                            case LAB_ADMIN_SEND_STL_FILES -> updates.add(
                                    (LabAdminSendStlFilesUpdate.from(event, patient)));
                            case THIRD_PARTY_CUSTOMER_REQUEST_STL_FILES -> updates.add(
                                    (ThirdPartyCustomerRequestForStlFilesUpdate.from(event, patient)));
                            case STL_FILE_APPROVED -> updates.add((StlFileApprovedUpdate.from(event, patient)));
                            case THIRD_PARTY_CUSTOMER_REQUEST_RE_PLAN -> updates.add(
                                    (ThirdPartyCustomerRequestForReplanUpdate.from(event, patient)));
                            case THIRD_PARTY_CUSTOMER_SEND_CASE -> updates.add(
                                    (ThirdPartyCustomerSendCaseUpdate.from(event, patient)));
                            case THIRD_PARTY_CUSTOMER_APPROVE_TREATMENT_PLAN -> {
                                if (event.getMetadata()
                                        instanceof ThirdPartyCustomerApproveTreatmentPlanMetadata metadata) {
                                    updates.add(ThirdPartyCustomerApproveTreatmentPlanUpdate.from(event, patient));
                                }
                            }
                            case MANUFACTURING_STARTED -> updates.add(
                                    (ManufacturingStartedEventUpdate.from(event, patient)));
                            case MANUFACTURING_COMPLETED -> updates.add(
                                    (ManufacturingCompletedEventUpdate.from(event, patient)));
                            case MANUFACTURING_IN_TRANSIT -> updates.add(
                                    (ManufacturingInTransitEventUpdate.from(event, patient)));
                            case PATIENT_ASSIGNED_TO_PRACTICE -> updates.add(
                                    (PatientAssignedToPracticeEventUpdate.from(event, patient)));
                            case MANUFACTURING_DELIVERED -> updates.add(
                                    (ManufacturingDeliveredEventUpdate.from(event, patient)));
                            case NEED_MORE_INFO_REQUESTED -> updates.add(
                                    (OrgRequestedOrderForNeedMoreInfoUpdate.from(event, patient)));
                            case UPDATED_FROM_NEED_MORE_INFO_TO_ORDERED -> updates.add(
                                    (UpdatedFromNeedMoreInfoToOrderedUpdate.from(event, patient)));
                            case TREATMENT_COMPLETED -> updates.add(
                                    (TreatmentCompletedMetadataUpdate.from(event, patient)));
                            case CASE_ASSIGNED_TO_YOU -> updates.add(
                                    (CaseAssignedToYouMetadataUpdate.from(event, patient)));
                            case NEW_COMMENT_ADDED -> updates.add((NewCommentAddedMetadataUpdate.from(event, patient)));
                            case CASE_MOVED_TO_PLANNING -> updates.add(
                                    (CaseMovedToPlanningMetadataUpdate.from(event, patient)));
                            case CASE_MOVED_TO_PRODUCTION -> updates.add(
                                    (CaseMovedToProductionMetadataUpdate.from(event, patient)));
                            case CASE_READY_TO_BEGIN_TREATMENT -> updates.add(
                                    (CaseReadyToBeginTreatmentMetadataUpdate.from(event, patient)));
                            case STATUS_UPDATED -> updates.add((StatusUpdatedMetadataUpdate.from(event, patient)));
                            case RECORDS_ADDED -> updates.add((RecordsAddedMetadataUpdate.from(event, patient)));
                            case PRESCRIPTION_ADDED -> updates.add(
                                    (PrescriptionAddedMetadataUpdate.from(event, patient)));
                            case PLANNING_CASE_COMPLETED -> updates.add(
                                    (PlanningCaseCompletedMetadataUpdate.from(event, patient)));
                            case PLANNING_CUSTOMER_PATIENT_ONBOARDED -> updates.add(
                                    (PlanningCustomerPatientOnboardMetadataUpdate.from(event, patient)));
                            case PLANNING_CUSTOMER_LAB_UPLOADED_STL_FILES -> updates.add(
                                    (PlanningCustomerLabUploadedStlFilesMetadataUpdate.from(event, patient)));
                            case PLANNING_CUSTOMER_CASE_COMPLETED -> updates.add(
                                    (PlanningCustomerCaseCompletedMetadataUpdate.from(event, patient)));
                            case PLANNING_CUSTOMER_TREATMENT_PLAN_APPROVED -> updates.add(
                                    (PlanningCustomerTreatmentPlanApprovedMetadataUpdate.from(event, patient)));
                            case PLANNING_CUSTOMER_TREATMENT_PLAN_REVISION -> updates.add(
                                    (PlanningCustomerTreatmentPlanRevisionMetadataUpdate.from(event, patient)));
                            case PLANNING_CUSTOMER_TREATMENT_PLAN_SENT_FOR_APPROVAL -> updates.add(
                                    (PlanningCustomerTreatmentPlanSendForApprovalMetadataUpdate.from(event, patient)));
                            case PLANNING_CUSTOMER_NEED_MORE_INFO_REQUESTED -> updates.add(
                                    (PlanningCustomerNeedMoreInfoRequestedMetadataUpdate.from(event, patient)));
                            case NEW_MESSAGE -> updates.add(
                                    (PlanningCustomerNewMessageMetadataUpdate.from(event, patient)));
                            case VSP_CASE_ASSIGNED -> updates.add(
                                    (VspCaseAssignedEventMetadataUpdate.from(event, patient)));
                            case VSP_CASE_SUBMITTED -> updates.add(
                                    (VspCaseSubmitEventMetadataUpdate.from(event, patient)));
                            case VSP_FILES_UPLOADED -> updates.add(
                                    (VspFileUploadedEventMetadataUpdate.from(event, patient)));
                            case VSP_PLAN_READY_FOR_REVIEW -> updates.add(
                                    (VspPlanReadyForReviewEventMetadataUpdate.from(event, patient)));
                            case VSP_PLAN_APPROVED -> updates.add(
                                    (VspPlanApprovedEventMetadataUpdate.from(event, patient)));
                            case VSP_REVISION_REQUESTED -> updates.add(
                                    (VspRevisionRequestedEventMetadataUpdate.from(event, patient)));
                            case VSP_MORE_INFORMATION_REQUIRED -> updates.add(
                                    (VspMoreInfoRequiredEventMetadataUpdate.from(event, patient)));
                            case VSP_PLANNING_COMPLETED -> updates.add(
                                    (VspPlanningCompletedEventMetadataUpdate.from(event, patient)));
                            case VSP_PRODUCTION_ORDER_CREATED -> updates.add(
                                    (VspProductionOrderCreatedEventMetadataUpdate.from(event, patient)));
                            case VSP_ORDER_SHIPPED -> updates.add(
                                    (VspOrderShippedEventMetadataUpdate.from(event, patient)));
                            case VSP_ORDER_DELIVERED -> updates.add(
                                    (VspOrderDeliveredEventMetadataUpdate.from(event, patient)));
                            case VSP_NEW_MESSAGE_LAB_TO_CUSTOMER -> updates.add(
                                    (VspNewMessageLabToCustomerEventMetadataUpdate.from(event, patient)));
                            case VSP_NEW_MESSAGE_CUSTOMER_TO_LAB -> updates.add(
                                    (VspNewMessageCustomerToLabEventMetadataUpdate.from(event, patient)));
                            default -> log.warn("Not handled event {}.", event);
                        }
                    });
                });

        eventsForDoctor.stream()
                .filter(event -> allowedEventTypes == null
                        || allowedEventTypes.isEmpty()
                        || allowedEventTypes.contains(event.getType()))
                .forEach(event -> {
                    switch (event.getType()) {
                        case PRACTICE_CONNECTED_ORG -> {
                            if (!adminWithDefaultTag) {
                                updates.add((PracticeConnectedEventUpdate.from(event)));
                            }
                        }
                        case DOCTOR_INVITATION_RECEIVED -> updates.add((DoctorInvitationReceivedUpdate.from(event)));
                        case DOCTOR_INVITATION_REJECTED -> updates.add((DoctorInvitationRejectedUpdate.from(event)));
                    }
                });
        updates.sort(Comparator.comparing(Update::getEventAt).reversed());
        return new AllUpdates(updates, null, totalActiveEventCount, totalAlignerEventActiveCount);
    }

    @Override
    @Transactional(readOnly = true)
    public TimelineDetails getEvents(UserType userType, Long userId, Boolean onlyActive) {
        log.info("Fetching the events of {} with id {}", userType, userId);
        List<Event> events;
        if (onlyActive) {
            events = eventRepository.findByUserIdAndUserTypeAndActive(userId, userType, true);
        } else {
            events = eventRepository.findByUserIdAndUserType(userId, userType);
        }

        if (onlyActive) {
            events.addAll(eventRepository.findByForUserIdAndForUserTypeAndActive(userId, userType, true));
        } else {
            events.addAll(eventRepository.findByForUserIdAndForUserType(userId, userType));
        }

        events.sort(Comparator.comparing(Event::getEventTime).reversed());

        events.stream()
                .filter(event -> event.getType() == EventType.ALIGNER_CHECK_IN)
                .forEach(this::updateAlignerCheckInEvent);

        return TimelineDetails.from(events);
    }

    @Transactional(readOnly = true)
    @Override
    public TimelineDetailsWithPagination getEventsV2WithPagination(
            UserType userType, Long patientId, Boolean onlyActive, int page, int size) {
        log.info(
                "Fetching timeline events for {} with id {} with pagination - page: {}, size: {}",
                userType,
                patientId,
                page,
                size);

        List<Event> allEvents = eventRepository.findTimelineEvents(patientId, userType.name(), onlyActive);

        Optional<Patient> patient = Optional.empty();
        for (Event event : allEvents) {
            if (event.getType() == EventType.ALIGNER_CHECK_IN) {
                var metadata = (AlignerCheckInEventMetadata) event.getMetadata();

                if (patient.isEmpty()) {
                    patient = profileService.getPatientForTimeline(metadata.getPatientId());
                }

                patient.ifPresent(p -> updateAlignerCheckInEvent(event, p));
            }
        }

        int totalElements = allEvents.size();
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);

        List<Event> paginatedEvents = fromIndex < totalElements
                ? allEvents.stream().skip(fromIndex).limit(size).toList()
                : new ArrayList<>();

        int totalPages = (int) Math.ceil((double) totalElements / size);
        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(page)
                .pageSize(size)
                .totalPatients(totalElements)
                .totalPages(totalPages)
                .hasNext(toIndex < totalElements)
                .hasPrevious(page > 0)
                .build();

        TimelineDetails timelineDetails = TimelineDetails.from(paginatedEvents);

        return TimelineDetailsWithPagination.builder()
                .timelineDetails(timelineDetails)
                .paginationDetails(paginationDetails)
                .build();
    }

    private void updateAlignerCheckInEvent(Event event) {
        if (event.getType() != EventType.ALIGNER_CHECK_IN) {
            return;
        }

        var metadata = (AlignerCheckInEventMetadata) event.getMetadata();
        var patient = profileService.getPatientForTimeline(metadata.getPatientId());
        if (patient.isPresent()) {
            var action = alignerActionRepository
                    .findById(metadata.getAlignerActionId())
                    .orElseThrow(() -> new AlignerActionNotFoundException(metadata.getAlignerActionId()));
            var checkInDetails = (AlignerCheckInMetadata) action.getMetadata();
            var feedbacks = alignerFeedbackRepository.findAllById(checkInDetails.getAlignerFeedbackIds());
            var photos = alignerPhotoRepository.findAllById(checkInDetails.getAlignerPhotoIds());

            AlignerCheckInUpdate update = AlignerCheckInUpdate.from(event, patient.get(), action, feedbacks, photos);

            metadata.setUpdateData(update);
            event.setMetadata(metadata);
        }
    }

    private void updateAlignerCheckInEvent(Event event, Patient patient) {
        var metadata = (AlignerCheckInEventMetadata) event.getMetadata();
        var action = alignerActionRepository
                .findById(metadata.getAlignerActionId())
                .orElseThrow(() -> new AlignerActionNotFoundException(metadata.getAlignerActionId()));

        var checkInDetails = (AlignerCheckInMetadata) action.getMetadata();

        var feedbacks = alignerFeedbackRepository.findAllById(checkInDetails.getAlignerFeedbackIds());
        var photos = alignerPhotoRepository.findAllById(checkInDetails.getAlignerPhotoIds());

        AlignerCheckInUpdate update = AlignerCheckInUpdate.from(event, patient, action, feedbacks, photos);

        metadata.setUpdateData(update);
        event.setMetadata(metadata);
    }

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
                    Optional<CustomerAccessAndRevoke> opt =
                            customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                                    pdo.getUserProfile().getId(),
                                    pdo.getOrganization().getId());

                    if (opt.isPresent()) {
                        CustomerAccessAndRevoke c = opt.get();
                        if (!c.getIsTrackingEnabled() && isContains(eventType)) {
                            return;
                        }
                    }

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

        if (orgUserProfile == null) {
            return;
        }

        boolean shouldSkip = customerAccessAndRevokeRepository
                .findByProfileIdAndOrganizationId(orgUserProfile.getId(), organization.getId())
                .map(c -> !c.getIsTrackingEnabled() && isContains(eventType))
                .orElse(false);

        if (shouldSkip) {
            return;
        }

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

    @Override
    public void addEvent(
            Long userId,
            UserType userType,
            Long forUserId,
            UserType forUserType,
            EventType eventType,
            EventMetadata metadata,
            Long profileId) {
        var userProfile = userProfileRepository.findById(profileId);
        Long effectiveUserId = userId != null ? userId : SYSTEM_USER_ID;

        if (userProfile.isEmpty()) {
            return;
        }

        UserProfile p = userProfile.get();

        boolean shouldSkip = customerAccessAndRevokeRepository
                .findByProfileIdAndOrganizationId(p.getId(), p.getOrganization().getId())
                .map(c -> !c.getIsTrackingEnabled() && isContains(eventType))
                .orElse(false);

        if (shouldSkip) {
            return;
        }

        try {
            userProfile.ifPresent(profile -> eventRepository.save(new Event(
                    effectiveUserId,
                    userType,
                    forUserId,
                    forUserType,
                    LocalDateTime.now(),
                    eventType,
                    metadata,
                    true,
                    false,
                    profile,
                    profile.getOrganization())));
        } catch (Exception e) {
            log.error("Error while saving event for user {} with profileId {}", userId, profileId);
            throw new BadRequestException(
                    "Error while saving event for user " + userId + " with profileId " + profileId);
        }
    }

    private boolean isContains(EventType eventType) {
        List<EventType> events = List.of(
                EventType.CASE_READY_TO_BEGIN_TREATMENT,
                EventType.ALIGNER_CHANGE,
                EventType.MANUAL_ALIGNER_CHANGE,
                EventType.ALIGNER_CHECK_IN_FOR_DOCTOR,
                EventType.ALIGNER_CHANGE_FEEDBACK_ADDED,
                EventType.ALIGNER_CHECK_IN,
                EventType.ISSUE_REPORTED);
        return events.stream().anyMatch(eventType::equals);
    }

    @Override
    public Event inactivateEvent(Long eventId) {
        var event = eventRepository.findById(eventId).orElseThrow(() -> new EventNotFoundException(eventId));
        event.setActive(false);

        log.info("Inactivated the event {}", eventId);
        return eventRepository.save(event);
    }

    public Event readEvent(Long eventId) {
        var event = eventRepository.findById(eventId).orElseThrow(() -> new EventNotFoundException(eventId));
        event.setRead(true);

        log.info("Event marked as the read {}", eventId);
        return eventRepository.save(event);
    }

    @Override
    public List<Event> inactivateEvents(List<Long> eventIds) {
        return eventIds.stream().map(this::inactivateEvent).toList();
    }

    @Override
    public List<Event> readEvents(List<Long> eventIds) {
        return eventIds.stream().map(this::readEvent).toList();
    }

    private List<Long> getTotalAlignerEventActiveIds(long doctorId) {
        List<EventType> eventTypes = List.of(EventType.ALIGNER_CHANGE);
        List<Long> forUserIdEventIds =
                eventRepository.findActiveEventIdsByForUserIdAndForUserType(doctorId, UserType.DOCTOR, eventTypes);
        List<Long> userIdEventIds =
                eventRepository.findActiveEventIdsByUserIdAndUserType(doctorId, UserType.DOCTOR, eventTypes);

        List<Long> allEventIds = new ArrayList<>(forUserIdEventIds);
        allEventIds.addAll(userIdEventIds);
        return allEventIds;
    }

    public List<Long> getTotalActiveEventIds(long doctorId) {
        List<Long> forUserIdEventIds = eventRepository.findActiveEventIdsByForUserIdAndForUserType(
                doctorId, UserType.DOCTOR, getDoctorEventTypes());
        List<Long> userIdEventIds =
                eventRepository.findActiveEventIdsByUserIdAndUserType(doctorId, UserType.DOCTOR, getDoctorEventTypes());

        List<Long> allEventIds = new ArrayList<>(forUserIdEventIds);
        allEventIds.addAll(userIdEventIds);
        return allEventIds;
    }

    @Override
    public List<Event> readAllEvents(long doctorId, NotificationType notificationType) {

        if (notificationType != null) {

            if (notificationType.equals(NotificationType.ALL)) {
                List<Long> totalActiveEventIds = getTotalActiveEventIds(doctorId);
                return totalActiveEventIds.stream().map(this::readEvent).toList();
            }

            if (notificationType.equals(NotificationType.ALIGNER_CHANGE)) {
                List<Long> totalAlignerEventActiveIds = getTotalAlignerEventActiveIds(doctorId);
                return totalAlignerEventActiveIds.stream().map(this::readEvent).toList();
            }
        } else {
            throw new BadRequestException("Notification type not found");
        }
        return null;
    }

    @Override
    public void addTimelineNoteEvent(AddTimelineNoteEventRequest request) {
        addEvent(
                request.getDoctorId(),
                UserType.DOCTOR,
                request.getPatientId(),
                UserType.PATIENT,
                EventType.TIMELINE_NOTE_ADDED,
                new TimelineNoteAddedEventMetaData(
                        request.getDoctorId(), request.getPatientId(), request.getNote(), request.getTitle()));
    }

    @Override
    @Transactional
    public void updateAlignerChangeEventWithFeedbacks(
            AddAlignerFeedbackRequest request, AlignerJourney alignerJourney, int alignerNo) {
        var patientId = alignerJourney.getPatient().getId();
        var alignerJourneyId = alignerJourney.getId();
        var aligner = alignerJourney.getAligner(alignerNo);
        var now = ZonedDateTime.now();
        eventRepository
                .findByUserIdAndUserTypeAndForUserIdAndForUserTypeAndType(
                        patientId,
                        UserType.PATIENT,
                        alignerJourney.getDoctorId(),
                        UserType.DOCTOR,
                        EventType.ALIGNER_CHANGE)
                .forEach(event -> {
                    AlignerChangeEventEventMetadata metadata = (AlignerChangeEventEventMetadata) event.getMetadata();
                    if (!metadata.getAlignerJourneyId().equals(alignerJourneyId)) return;

                    if (metadata.isFeedbackOfAligner(aligner)) {
                        metadata.updatePreviousAlignerFeedback(aligner);

                        if (request.isValidationFeedback()) {
                            metadata.setValidated(true);
                            metadata.setValidatedAt(now);
                        }
                        event.setMetadata(metadata);
                        log.info(
                                "Updated feedbacks of the events for aligner {} of journey {}",
                                alignerNo,
                                alignerJourneyId);
                        eventRepository.save(event);
                    }
                });
    }

    private List<EventType> getPatientTimelineEventTypes() {
        return Arrays.asList(
                EventType.TREATMENT_PAUSED,
                EventType.TREATMENT_SETUP,
                EventType.PHOTO_ADDED_BY_DOCTOR,
                EventType.MESSAGE_SENT_TO_PATIENT,
                EventType.WEAR_DAYS_UPDATED,
                EventType.ALIGNER_CHANGE_FEEDBACK_ADDED_BY_DOCTOR,
                EventType.ALIGNER_CHANGE_VALIDATED,
                EventType.UPCOMING_ALIGNER_CHANGE,
                EventType.PATIENT_APPOINTMENT_REMINDER_ADDED,
                EventType.PATIENT_APPOINTMENT_REMINDER_UPDATED,
                EventType.PATIENT_APPOINTMENT_REMINDER_DELETED,
                EventType.TREATMENT_PLAN_APPROVED_BY_PATIENT,
                EventType.TREATMENT_PLAN_SENT_FOR_APPROVAL_TO_PATIENT,
                EventType.TREATMENT_COMPLETED,
                EventType.CASE_ASSIGNED_TO_YOU,
                EventType.NEW_COMMENT_ADDED,
                EventType.CASE_MOVED_TO_PLANNING,
                EventType.CASE_MOVED_TO_PRODUCTION,
                EventType.MANUFACTURING_COMPLETED,
                EventType.CASE_READY_TO_BEGIN_TREATMENT,
                EventType.STATUS_UPDATED,
                EventType.RECORDS_ADDED,
                EventType.PRESCRIPTION_ADDED,
                EventType.PLANNING_CASE_COMPLETED,
                EventType.PLANNING_CUSTOMER_PATIENT_ONBOARDED,
                EventType.PLANNING_CUSTOMER_LAB_UPLOADED_STL_FILES,
                EventType.PLANNING_CUSTOMER_CASE_COMPLETED,
                EventType.PLANNING_CUSTOMER_TREATMENT_PLAN_APPROVED,
                EventType.PLANNING_CUSTOMER_TREATMENT_PLAN_REVISION,
                EventType.PLANNING_CUSTOMER_TREATMENT_PLAN_SENT_FOR_APPROVAL,
                EventType.PLANNING_CUSTOMER_NEED_MORE_INFO_REQUESTED,
                EventType.NEW_MESSAGE,
                EventType.VSP_CASE_ASSIGNED,
                EventType.VSP_CASE_SUBMITTED,
                EventType.VSP_FILES_UPLOADED,
                EventType.VSP_PLAN_READY_FOR_REVIEW,
                EventType.VSP_PLAN_APPROVED,
                EventType.VSP_REVISION_REQUESTED,
                EventType.VSP_MORE_INFORMATION_REQUIRED,
                EventType.VSP_PLANNING_COMPLETED,
                EventType.VSP_PRODUCTION_ORDER_CREATED,
                EventType.VSP_ORDER_SHIPPED,
                EventType.VSP_ORDER_DELIVERED,
                EventType.VSP_NEW_MESSAGE_LAB_TO_CUSTOMER,
                EventType.VSP_NEW_MESSAGE_CUSTOMER_TO_LAB);
    }

    @Transactional(readOnly = true)
    @Override
    public AllUpdates getPatientTimelineEvents(
            Long doctorId,
            Long patientId,
            Boolean active,
            Set<EventType> allowedEventTypes,
            Long page,
            Long size,
            Boolean paginated) {
        List<Update> updates = new ArrayList<>();
        List<Event> eventsByDoctor;
        List<Event> eventsForDoctor;
        List<EventType> eventTypes = getPatientTimelineEventTypes();

        PaginationDetails paginationDetails = null;

        if (Boolean.TRUE.equals(paginated)) {
            int pageNumber = page != null ? page.intValue() : 0;
            int pageSize = size != null ? size.intValue() : 10;

            Pageable pageable =
                    PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());

            Page<Event> pageByDoctor;
            Page<Event> pageForDoctor;

            if (active == null) {
                pageByDoctor = eventRepository.findAllByUserIdAndUserTypeWithEventTypes(
                        doctorId, UserType.DOCTOR, eventTypes, pageable);

                pageForDoctor = eventRepository.findAllByForUserIdAndForUserTypeWithEventTypes(
                        doctorId, UserType.DOCTOR, eventTypes, pageable);
            } else {
                pageByDoctor = eventRepository.findAllByUserIdAndUserTypeAndActiveWithEventTypes(
                        doctorId, UserType.DOCTOR, active, eventTypes, pageable);

                pageForDoctor = eventRepository.findAllByForUserIdAndForUserTypeAndActiveWithEventTypes(
                        doctorId, UserType.DOCTOR, active, eventTypes, pageable);
            }

            eventsByDoctor = pageByDoctor.getContent();
            eventsForDoctor = pageForDoctor.getContent();

            long totalElements = pageByDoctor.getTotalElements() + pageForDoctor.getTotalElements();
            int totalPages = (int) Math.ceil((double) totalElements / pageSize);

            paginationDetails = PaginationDetails.builder()
                    .pageNumber(pageNumber)
                    .pageSize(pageSize)
                    .totalPatients((int) totalElements)
                    .totalPages(totalPages)
                    .hasNext(pageNumber + 1 < totalPages)
                    .hasPrevious(pageNumber > 0)
                    .build();
        } else {
            if (active == null) {
                eventsByDoctor =
                        eventRepository.findAllByUserIdAndUserTypeAndTypeIn(doctorId, UserType.DOCTOR, eventTypes);

                eventsForDoctor = eventRepository.findAllByForUserIdAndForUserTypeAndTypeIn(
                        doctorId, UserType.DOCTOR, eventTypes);
            } else {
                eventsByDoctor = eventRepository.findAllByUserIdAndUserTypeAndActiveAndTypeIn(
                        doctorId, UserType.DOCTOR, active, eventTypes);

                eventsForDoctor = eventRepository.findAllByForUserIdAndForUserTypeAndActiveAndTypeIn(
                        doctorId, UserType.DOCTOR, active, eventTypes);
            }
        }

        List<Event> filteredEvents = Stream.concat(eventsByDoctor.stream(), eventsForDoctor.stream())
                .filter(event -> allowedEventTypes == null
                        || allowedEventTypes.isEmpty()
                        || allowedEventTypes.contains(event.getType()))
                .toList();

        int batchSize = 100;
        ForkJoinPool customThreadPool = new ForkJoinPool(4);

        CompletableFuture<Void> firstJob = CompletableFuture.runAsync(() -> {
            try {
                customThreadPool
                        .submit(() -> IntStream.range(0, (filteredEvents.size() + batchSize - 1) / batchSize)
                                .parallel()
                                .forEach(batchIndex -> {
                                    int start = batchIndex * batchSize;
                                    int end = Math.min(start + batchSize, filteredEvents.size());
                                    List<Event> batch = filteredEvents.subList(start, end);

                                    batch.forEach(event -> {
                                        Optional<Patient> optionalPatient =
                                                profileService.getPatientForTimeline(patientId);
                                        optionalPatient.ifPresent(patient -> {
                                            switch (event.getType()) {
                                                case TREATMENT_PAUSED -> {
                                                    var metadata = (TreatmentPausedEventMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getAlignerJourneyDetails()
                                                            .getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p ->
                                                                    updates.add(TreatmentPausedUpdate.from(event, p)));
                                                }
                                                case TREATMENT_SETUP -> {
                                                    TreatmentSetupEventMetadata metadata =
                                                            (TreatmentSetupEventMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getAlignerJourneyDetails()
                                                            .getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p ->
                                                                    updates.add(TreatmentSetupUpdate.from(event, p)));
                                                }
                                                case MESSAGE_SENT_TO_PATIENT -> {
                                                    var metadata =
                                                            (MessageSentToPatientEventMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getPatientDetails()
                                                            .getId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    updates.add(MessageSentToPatientUpdate.from(event));
                                                }
                                                case WEAR_DAYS_UPDATED -> {
                                                    var metadata = (WearDaysUpdateEventMetaData) event.getMetadata();
                                                    var currentPatientId = metadata.getAlignerJourneyDetails()
                                                            .getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(WearDaysUpdate.from(event, p)));
                                                }
                                                case ALIGNER_CHANGE_FEEDBACK_ADDED_BY_DOCTOR -> {
                                                    var metadata = (AlignerChangeFeedbackAddedByPatientEventMetadata)
                                                            event.getMetadata();
                                                    var currentPatientId = metadata.getAlignerJourneyDetails()
                                                            .getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    AlignerChangeFeedbackAddedByPatientUpdate.from(
                                                                            event, p)));
                                                }
                                                case ALIGNER_CHANGE_VALIDATED -> {
                                                    var metadata = (AlignerChangeValidatedEventEventMetadata)
                                                            event.getMetadata();
                                                    var currentPatientId = metadata.getAlignerJourneyDetails()
                                                            .getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    AlignerChangeValidatedUpdate.from(event, p)));
                                                }
                                                case UPCOMING_ALIGNER_CHANGE -> {
                                                    var metadata =
                                                            (UpcomingAlignerChangeEventMetaData) event.getMetadata();
                                                    var currentPatientId = metadata.getAlignerJourneyDetails()
                                                            .getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    UpcomingAlignerChangeUpdate.from(event, p)));
                                                }
                                                case PATIENT_APPOINTMENT_REMINDER_ADDED -> {
                                                    CustomAppointmentReminderAddedEventMetadata metadata =
                                                            (CustomAppointmentReminderAddedEventMetadata)
                                                                    event.getMetadata();
                                                    Long currentPatientId = metadata.getPatientDetails()
                                                            .getId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(metadata.getPatientDetails()
                                                                    .getId())
                                                            .ifPresent(p -> updates.add(
                                                                    CustomAppointmentReminderAddedResponse.from(
                                                                            event, p, metadata.getAppointmentId())));
                                                }
                                                case PATIENT_APPOINTMENT_REMINDER_UPDATED -> {
                                                    CustomAppointmentReminderUpdatedEventMetadata metadata =
                                                            (CustomAppointmentReminderUpdatedEventMetadata)
                                                                    event.getMetadata();
                                                    Long currentPatientId = metadata.getPatientDetails()
                                                            .getId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(metadata.getPatientDetails()
                                                                    .getId())
                                                            .ifPresent(p -> updates.add(
                                                                    CustomAppointmentReminderUpdatedResponse.from(
                                                                            event, p, metadata.getAppointmentId())));
                                                }
                                                case PATIENT_APPOINTMENT_REMINDER_DELETED -> {
                                                    CustomAppointmentReminderDeletedEventMetadata metadata =
                                                            (CustomAppointmentReminderDeletedEventMetadata)
                                                                    event.getMetadata();
                                                    Long currentPatientId = metadata.getPatientDetails()
                                                            .getId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(metadata.getPatientDetails()
                                                                    .getId())
                                                            .ifPresent(p -> updates.add(
                                                                    CustomAppointmentReminderDeletedResponse.from(
                                                                            event, p, metadata.getAppointmentId())));
                                                }
                                                case TREATMENT_PLAN_APPROVED_BY_PATIENT -> {
                                                    TreatmentPlanApprovedEventMetadata metadata =
                                                            (TreatmentPlanApprovedEventMetadata) event.getMetadata();

                                                    Long currentPatientId = metadata.getAlignerTreatmentResponse()
                                                            .getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }

                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p ->
                                                                    updates.add(TreatmentPausedUpdate.from(event, p)));
                                                }
                                                case TREATMENT_PLAN_SENT_FOR_APPROVAL_TO_PATIENT -> {
                                                    TreatmentPlanSentForApprovalEventMetadata metadata =
                                                            (TreatmentPlanSentForApprovalEventMetadata)
                                                                    event.getMetadata();

                                                    Long currentPatientId = metadata.getAlignerTreatmentResponse()
                                                            .getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }

                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p ->
                                                                    updates.add(TreatmentPausedUpdate.from(event, p)));
                                                }
                                                case TREATMENT_COMPLETED -> {
                                                    TreatmentCompletedEventMetadata metadata =
                                                            (TreatmentCompletedEventMetadata) event.getMetadata();

                                                    if (metadata.getTreatmentCompleted() != null) {
                                                        Long currentPatientId = metadata.getTreatmentCompleted()
                                                                .getPatientId();
                                                        if (!currentPatientId.equals(patientId)) {
                                                            return;
                                                        }
                                                        profileService
                                                                .getPatientForTimeline(currentPatientId)
                                                                .ifPresent(p -> updates.add(
                                                                        TreatmentCompletedMetadataUpdate.from(
                                                                                event, p)));
                                                    }
                                                }

                                                case CASE_ASSIGNED_TO_YOU -> {
                                                    var metadata = (CaseAssignedToYouEventMetadata) event.getMetadata();
                                                    Long currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    CaseAssignedToYouMetadataUpdate.from(event, p)));
                                                }

                                                case NEW_COMMENT_ADDED -> {
                                                    var metadata = (NewCommentAddedEventMetadata) event.getMetadata();
                                                    Long currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    NewCommentAddedMetadataUpdate.from(event, p)));
                                                }

                                                case CASE_MOVED_TO_PLANNING -> {
                                                    var metadata =
                                                            (CaseMovedToPlanningEventMetadata) event.getMetadata();
                                                    Long currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    CaseMovedToPlanningMetadataUpdate.from(event, p)));
                                                }
                                                case CASE_MOVED_TO_PRODUCTION -> {
                                                    var metadata =
                                                            (CaseMovedToProductionEventMetadata) event.getMetadata();
                                                    Long currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    CaseMovedToProductionMetadataUpdate.from(
                                                                            event, p)));
                                                }
                                                case CASE_READY_TO_BEGIN_TREATMENT -> {
                                                    var metadata = (CaseReadyToBeginTreatmentEventMetadata)
                                                            event.getMetadata();
                                                    Long currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    CaseReadyToBeginTreatmentMetadataUpdate.from(
                                                                            event, p)));
                                                }
                                                case STATUS_UPDATED -> {
                                                    var metadata = (StatusUpdatedEventMetadata) event.getMetadata();
                                                    Long currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    StatusUpdatedMetadataUpdate.from(event, p)));
                                                }
                                                case RECORDS_ADDED -> {
                                                    var metadata = (RecordsAddedEventMetadata) event.getMetadata();
                                                    Long currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    RecordsAddedMetadataUpdate.from(event, p)));
                                                }
                                                case PRESCRIPTION_ADDED -> {
                                                    var metadata = (PrescriptionAddedEventMetadata) event.getMetadata();
                                                    Long currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    PrescriptionAddedMetadataUpdate.from(event, p)));
                                                }
                                                case PLANNING_CASE_COMPLETED -> {
                                                    var metadata =
                                                            (PlanningCaseCompletedEventMetadata) event.getMetadata();
                                                    Long currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    PlanningCaseCompletedMetadataUpdate.from(
                                                                            event, p)));
                                                }
                                                case PLANNING_CUSTOMER_PATIENT_ONBOARDED -> {
                                                    var metadata = (PlanningCustomerPatientOnboardMetadata)
                                                            event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    PlanningCustomerPatientOnboardMetadataUpdate.from(
                                                                            event, p)));
                                                }

                                                case PLANNING_CUSTOMER_LAB_UPLOADED_STL_FILES -> {
                                                    var metadata = (PlanningCustomerLabUploadedStlFilesMetadata)
                                                            event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    PlanningCustomerLabUploadedStlFilesMetadataUpdate
                                                                            .from(event, p)));
                                                }

                                                case PLANNING_CUSTOMER_CASE_COMPLETED -> {
                                                    var metadata =
                                                            (PlanningCustomerCaseCompletedMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    PlanningCustomerCaseCompletedMetadataUpdate.from(
                                                                            event, p)));
                                                }

                                                case PLANNING_CUSTOMER_TREATMENT_PLAN_APPROVED -> {
                                                    var metadata = (PlanningCustomerTreatmentPlanApprovedMetadata)
                                                            event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    PlanningCustomerTreatmentPlanApprovedMetadataUpdate
                                                                            .from(event, p)));
                                                }

                                                case PLANNING_CUSTOMER_TREATMENT_PLAN_REVISION -> {
                                                    var metadata = (PlanningCustomerTreatmentPlanRevisionMetadata)
                                                            event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    PlanningCustomerTreatmentPlanRevisionMetadataUpdate
                                                                            .from(event, p)));
                                                }

                                                case PLANNING_CUSTOMER_TREATMENT_PLAN_SENT_FOR_APPROVAL -> {
                                                    var metadata =
                                                            (PlanningCustomerTreatmentPlanSendForApprovalMetadata)
                                                                    event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    PlanningCustomerTreatmentPlanSendForApprovalMetadataUpdate
                                                                            .from(event, p)));
                                                }

                                                case PLANNING_CUSTOMER_NEED_MORE_INFO_REQUESTED -> {
                                                    var metadata = (PlanningCustomerNeedMoreInfoRequestedMetadata)
                                                            event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    PlanningCustomerNeedMoreInfoRequestedMetadataUpdate
                                                                            .from(event, p)));
                                                }

                                                case NEW_MESSAGE -> {
                                                    var metadata =
                                                            (PlanningCustomerNewMessageMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    PlanningCustomerNewMessageMetadataUpdate.from(
                                                                            event, p)));
                                                }

                                                case VSP_CASE_ASSIGNED -> {
                                                    var metadata = (VspCaseAssignedEventMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    VspCaseAssignedEventMetadataUpdate.from(event, p)));
                                                }

                                                case VSP_CASE_SUBMITTED -> {
                                                    var metadata = (VspCaseSubmitEventMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    VspCaseSubmitEventMetadataUpdate.from(event, p)));
                                                }

                                                case VSP_FILES_UPLOADED -> {
                                                    var metadata = (VspFileUploadedEventMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    VspFileUploadedEventMetadataUpdate.from(event, p)));
                                                }

                                                case VSP_PLAN_READY_FOR_REVIEW -> {
                                                    var metadata =
                                                            (VspPlanReadyForReviewEventMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    VspPlanReadyForReviewEventMetadataUpdate.from(
                                                                            event, p)));
                                                }

                                                case VSP_PLAN_APPROVED -> {
                                                    var metadata = (VspPlanApprovedEventMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    VspPlanApprovedEventMetadataUpdate.from(event, p)));
                                                }

                                                case VSP_REVISION_REQUESTED -> {
                                                    var metadata =
                                                            (VspRevisionRequestedEventMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    VspRevisionRequestedEventMetadataUpdate.from(
                                                                            event, p)));
                                                }

                                                case VSP_MORE_INFORMATION_REQUIRED -> {
                                                    var metadata =
                                                            (VspMoreInfoRequiredEventMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    VspMoreInfoRequiredEventMetadataUpdate.from(
                                                                            event, p)));
                                                }

                                                case VSP_PLANNING_COMPLETED -> {
                                                    var metadata =
                                                            (VspPlanningCompletedEventMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    VspPlanningCompletedEventMetadataUpdate.from(
                                                                            event, p)));
                                                }

                                                case VSP_PRODUCTION_ORDER_CREATED -> {
                                                    var metadata = (VspProductionOrderCreatedEventMetadata)
                                                            event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    VspProductionOrderCreatedEventMetadataUpdate.from(
                                                                            event, p)));
                                                }

                                                case VSP_ORDER_SHIPPED -> {
                                                    var metadata = (VspOrderShippedEventMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    VspOrderShippedEventMetadataUpdate.from(event, p)));
                                                }

                                                case VSP_ORDER_DELIVERED -> {
                                                    var metadata = (VspOrderDeliveredEventMetadata) event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    VspOrderDeliveredEventMetadataUpdate.from(
                                                                            event, p)));
                                                }

                                                case VSP_NEW_MESSAGE_LAB_TO_CUSTOMER -> {
                                                    var metadata = (VspNewMessageLabToCustomerEventMetadata)
                                                            event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    VspNewMessageLabToCustomerEventMetadataUpdate.from(
                                                                            event, p)));
                                                }

                                                case VSP_NEW_MESSAGE_CUSTOMER_TO_LAB -> {
                                                    var metadata = (VspNewMessageCustomerToLabEventMetadata)
                                                            event.getMetadata();
                                                    var currentPatientId = metadata.getPatientId();
                                                    if (!currentPatientId.equals(patientId)) {
                                                        return;
                                                    }
                                                    profileService
                                                            .getPatientForTimeline(currentPatientId)
                                                            .ifPresent(p -> updates.add(
                                                                    VspNewMessageCustomerToLabEventMetadataUpdate.from(
                                                                            event, p)));
                                                }
                                            }
                                        });
                                    });
                                }))
                        .get();
            } catch (InterruptedException | ExecutionException e) {
                log.error("Error processing events in parallel", e);
            } finally {
                customThreadPool.shutdown();
            }
        });

        int batchSizeForDoctor = 100;
        ForkJoinPool customThreadPoolForDoctor = new ForkJoinPool(4);

        CompletableFuture<Void> secondJob = CompletableFuture.runAsync(() -> {
            try {
                customThreadPoolForDoctor
                        .submit(() -> IntStream.range(
                                        0, (eventsForDoctor.size() + batchSizeForDoctor - 1) / batchSizeForDoctor)
                                .parallel()
                                .forEach(batchIndex -> {
                                    int start = batchIndex * batchSizeForDoctor;
                                    int end = Math.min(start + batchSizeForDoctor, eventsForDoctor.size());
                                    List<Event> batch = eventsForDoctor.subList(start, end);

                                    batch.stream()
                                            .filter(event -> allowedEventTypes == null
                                                    || allowedEventTypes.isEmpty()
                                                    || allowedEventTypes.contains(event.getType()))
                                            .filter(event -> event.getUserType().equals(UserType.PATIENT))
                                            .filter(event -> {
                                                if (patientId != null) {
                                                    return event.getUserId().equals(patientId);
                                                }
                                                return true;
                                            })
                                            .forEach(event -> {
                                                Optional<Patient> optionalPatient =
                                                        profileService.getPatientForTimeline(event.getUserId());
                                                optionalPatient.ifPresent(patient -> {
                                                    switch (event.getType()) {
                                                        case ALIGNER_CHANGE -> updates.add(
                                                                AlignerChangeUpdate.from(event, patient));
                                                        case MESSAGE_SENT_TO_DOCTOR -> updates.add(
                                                                MessageSentToDoctorUpdate.from(event));
                                                        case MISSED_ALIGNER_CHANGED_DATE -> updates.add(
                                                                MissedAlignerChangeDateUpdate.from(event, patient));
                                                        case PATIENT_FILLED_MISSING_DATA -> updates.add(
                                                                (MissingAlignerDataFillUpdate.from(event, patient)));
                                                        case ALIGNER_CHANGE_FEEDBACK_ADDED -> updates.add(
                                                                AlignerChangeFeedbackAddedUpdate.from(event, patient));
                                                        case TREATMENT_STARTING -> updates.add(
                                                                TreatmentStartingUpdate.from(event, patient));
                                                        case PATIENT_CONNECTED_WITH_DOCTOR -> {
                                                            List<AlignerJourney> alignerJourneys =
                                                                    alignerJourneyRepository.findByPatientId(
                                                                            patient.getId());
                                                            var alignerJourney = alignerJourneys.stream()
                                                                    .filter(journey -> journey.getPatient()
                                                                            .getId()
                                                                            .equals(patient.getId()))
                                                                    .findFirst();
                                                            long alignerJourneyId = alignerJourney
                                                                    .map(AlignerJourney::getId)
                                                                    .orElse(0L);
                                                            updates.add(PatientInvitationAcceptedUpdate.from(
                                                                    event, alignerJourneyId));
                                                        }
                                                        case ALIGNER_PRODUCTION_ORDER_REMINDER -> updates.add(
                                                                AlignerProductionOrderReminderUpdate.from(event));
                                                        case UPGRADE_PATIENT_TO_MOBILE_APP -> updates.add(
                                                                UpgradePatientToMobileAppUpdate.from(event, patient));
                                                        case RESUME_TREATMENT_REMINDER -> updates.add(
                                                                ResumeTreatmentReminderUpdate.from(event, patient));
                                                        case CREATE_REFINEMENT_REMINDER -> updates.add(
                                                                (CreateRefinementTreatmentUpdate.from(event, patient)));
                                                        case MANUAL_ALIGNER_CHANGE -> updates.add(
                                                                (ManualAlignerChangeUpdate.from(event, patient)));
                                                        case ALIGNER_CHECK_IN_FOR_DOCTOR -> {
                                                            var metadata = (AlignerCheckInForDoctorEventMetadata)
                                                                    event.getMetadata();
                                                            Long currentPatientId = metadata.getPatientId();
                                                            if (patientId != null
                                                                    && !currentPatientId.equals(patientId)) {
                                                                return;
                                                            }
                                                            var action = alignerActionRepository
                                                                    .findById(metadata.getAlignerActionId())
                                                                    .orElseThrow(
                                                                            () -> new AlignerActionNotFoundException(
                                                                                    metadata.getAlignerActionId()));
                                                            var checkInDetails =
                                                                    (AlignerCheckInMetadata) action.getMetadata();
                                                            var feedbacks = alignerFeedbackRepository.findAllById(
                                                                    checkInDetails.getAlignerFeedbackIds());
                                                            var photos = alignerPhotoRepository.findAllById(
                                                                    checkInDetails.getAlignerPhotoIds());

                                                            updates.add((AlignerCheckInForDoctorUpdate.from(
                                                                    event, patient, action, feedbacks, photos)));
                                                        }
                                                        case ISSUE_REPORTED -> updates.add(
                                                                (AlignerIssueUpdate.from(event, patient)));
                                                        case APPOINTMENT_REMINDER -> updates.add(
                                                                (AppointmentReminderUpdate.from(event, patient)));
                                                        case PAYMENT_REMINDER -> updates.add(
                                                                (PaymentReminderUpdate.from(event, patient)));

                                                        case CALENDAR_REMINDER -> updates.add(
                                                                (CalendarEventUpdate.from(event, patient)));
                                                        case PRACTICE_CONNECTED_ORG -> updates.add(
                                                                (PracticeConnectedEventUpdate.from(event, patient)));
                                                        case PATIENT_ADDED_BY_PRACTICE -> updates.add(
                                                                (PatientAddedByPracticeEventUpdate.from(
                                                                        event, patient)));
                                                        case PATIENT_ASSIGNED_TO_PRACTICE -> updates.add(
                                                                (PatientAssignedToPracticeEventUpdate.from(
                                                                        event, patient)));
                                                        case TREATMENT_COMPLETED -> updates.add(
                                                                (TreatmentCompletedMetadataUpdate.from(
                                                                        event, patient)));
                                                        case CASE_ASSIGNED_TO_YOU -> updates.add(
                                                                (CaseAssignedToYouMetadataUpdate.from(event, patient)));
                                                        case NEW_COMMENT_ADDED -> updates.add(
                                                                (NewCommentAddedMetadataUpdate.from(event, patient)));
                                                        case CASE_MOVED_TO_PLANNING -> updates.add(
                                                                (CaseMovedToPlanningMetadataUpdate.from(
                                                                        event, patient)));
                                                        case CASE_MOVED_TO_PRODUCTION -> updates.add(
                                                                (CaseMovedToProductionMetadataUpdate.from(
                                                                        event, patient)));
                                                        case CASE_READY_TO_BEGIN_TREATMENT -> updates.add(
                                                                (CaseReadyToBeginTreatmentMetadataUpdate.from(
                                                                        event, patient)));
                                                        case STATUS_UPDATED -> updates.add(
                                                                (StatusUpdatedMetadataUpdate.from(event, patient)));
                                                        case RECORDS_ADDED -> updates.add(
                                                                (RecordsAddedMetadataUpdate.from(event, patient)));
                                                        case PRESCRIPTION_ADDED -> updates.add(
                                                                (PrescriptionAddedMetadataUpdate.from(event, patient)));
                                                        case PLANNING_CASE_COMPLETED -> updates.add(
                                                                (PlanningCaseCompletedMetadataUpdate.from(
                                                                        event, patient)));
                                                        case PLANNING_CUSTOMER_PATIENT_ONBOARDED -> updates.add(
                                                                (PlanningCustomerPatientOnboardMetadataUpdate.from(
                                                                        event, patient)));
                                                        case PLANNING_CUSTOMER_LAB_UPLOADED_STL_FILES -> updates.add(
                                                                (PlanningCustomerLabUploadedStlFilesMetadataUpdate.from(
                                                                        event, patient)));
                                                        case PLANNING_CUSTOMER_CASE_COMPLETED -> updates.add(
                                                                (PlanningCustomerCaseCompletedMetadataUpdate.from(
                                                                        event, patient)));
                                                        case PLANNING_CUSTOMER_TREATMENT_PLAN_APPROVED -> updates.add(
                                                                (PlanningCustomerTreatmentPlanApprovedMetadataUpdate
                                                                        .from(event, patient)));
                                                        case PLANNING_CUSTOMER_TREATMENT_PLAN_REVISION -> updates.add(
                                                                (PlanningCustomerTreatmentPlanRevisionMetadataUpdate
                                                                        .from(event, patient)));
                                                        case PLANNING_CUSTOMER_TREATMENT_PLAN_SENT_FOR_APPROVAL -> updates
                                                                .add(
                                                                        (PlanningCustomerTreatmentPlanSendForApprovalMetadataUpdate
                                                                                .from(event, patient)));
                                                        case PLANNING_CUSTOMER_NEED_MORE_INFO_REQUESTED -> updates.add(
                                                                (PlanningCustomerNeedMoreInfoRequestedMetadataUpdate
                                                                        .from(event, patient)));
                                                        case NEW_MESSAGE -> updates.add(
                                                                (PlanningCustomerNewMessageMetadataUpdate.from(
                                                                        event, patient)));
                                                        case VSP_CASE_ASSIGNED -> updates.add(
                                                                (VspCaseAssignedEventMetadataUpdate.from(
                                                                        event, patient)));
                                                        case VSP_CASE_SUBMITTED -> updates.add(
                                                                (VspCaseSubmitEventMetadataUpdate.from(
                                                                        event, patient)));
                                                        case VSP_FILES_UPLOADED -> updates.add(
                                                                (VspFileUploadedEventMetadataUpdate.from(
                                                                        event, patient)));
                                                        case VSP_PLAN_READY_FOR_REVIEW -> updates.add(
                                                                (VspPlanReadyForReviewEventMetadataUpdate.from(
                                                                        event, patient)));
                                                        case VSP_PLAN_APPROVED -> updates.add(
                                                                (VspPlanApprovedEventMetadataUpdate.from(
                                                                        event, patient)));
                                                        case VSP_REVISION_REQUESTED -> updates.add(
                                                                (VspRevisionRequestedEventMetadataUpdate.from(
                                                                        event, patient)));
                                                        case VSP_MORE_INFORMATION_REQUIRED -> updates.add(
                                                                (VspMoreInfoRequiredEventMetadataUpdate.from(
                                                                        event, patient)));
                                                        case VSP_PLANNING_COMPLETED -> updates.add(
                                                                (VspPlanningCompletedEventMetadataUpdate.from(
                                                                        event, patient)));
                                                        case VSP_PRODUCTION_ORDER_CREATED -> updates.add(
                                                                (VspProductionOrderCreatedEventMetadataUpdate.from(
                                                                        event, patient)));
                                                        case VSP_ORDER_SHIPPED -> updates.add(
                                                                (VspOrderShippedEventMetadataUpdate.from(
                                                                        event, patient)));
                                                        case VSP_ORDER_DELIVERED -> updates.add(
                                                                (VspOrderDeliveredEventMetadataUpdate.from(
                                                                        event, patient)));
                                                        case VSP_NEW_MESSAGE_LAB_TO_CUSTOMER -> updates.add(
                                                                (VspNewMessageLabToCustomerEventMetadataUpdate.from(
                                                                        event, patient)));
                                                        case VSP_NEW_MESSAGE_CUSTOMER_TO_LAB -> updates.add(
                                                                (VspNewMessageCustomerToLabEventMetadataUpdate.from(
                                                                        event, patient)));
                                                    }
                                                });
                                            });
                                }))
                        .get();
            } catch (InterruptedException | ExecutionException e) {
                log.error("Error processing events in parallel", e);
            } finally {
                customThreadPoolForDoctor.shutdown();
            }
        });

        CompletableFuture<Void> combinedFuture = CompletableFuture.allOf(firstJob, secondJob);
        combinedFuture.join();

        updates.sort(Comparator.comparing(Update::getEventAt).reversed());
        return new AllUpdates(updates, paginationDetails, 0, 0);
    }

    @Override
    public List<Long> getEventIds(Long doctorId, Long patientId, Boolean active, List<EventType> allowedEventTypes) {

        List<Long> forUserIdEventIds = eventRepository.findActiveEventIdsByForUserIdAndForUserTypeAndUserId(
                doctorId, UserType.DOCTOR, allowedEventTypes, patientId);

        return new ArrayList<>(forUserIdEventIds);
    }

    @Override
    public List<Long> readAllEventsByProfileId(EventReadRequest request) {
        NotificationType notificationType = request.getNotificationType();

        if (notificationType == null) {
            throw new BadRequestException("Notification type not found");
        }
        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            request.setProfileId(userProfile.getId());
            request.setDoctorId(userProfile.getDoctor().getId());
            request.setOrganizationId(userProfile.getOrganization().getId());
        }

        List<EventType> eventTypes =
                switch (notificationType) {
                    case ALL -> getDoctorEventTypes();
                    case ALIGNER_CHANGE -> List.of(EventType.ALIGNER_CHANGE);
                    default -> throw new BadRequestException("Unsupported notification type: " + notificationType);
                };

        List<Long> activeEventIds = getTotalActiveUnreadEventIdsByProfile(request.getProfileId(), eventTypes);
        activeEventIds.forEach(this::readEvent);

        return activeEventIds;
    }

    public List<Long> getTotalActiveUnreadEventIdsByProfile(long profileId, List<EventType> eventTypes) {
        List<Long> forUserIdEventIds =
                eventRepository.findActiveEventIdsByForUserTypeAndProfile(profileId, UserType.DOCTOR, eventTypes);
        List<Long> userIdEventIds =
                eventRepository.findActiveEventIdsByUserTypeAndProfile(profileId, UserType.DOCTOR, eventTypes);

        List<Long> allEventIds = new ArrayList<>(forUserIdEventIds);
        allEventIds.addAll(userIdEventIds);
        return allEventIds;
    }

    @Override
    @Transactional(readOnly = true)
    public ProgressPhotoResponse getRecentAlignerCheckInPhotos(Long doctorId, Long patientId, int limit) {
        List<Event> recentCheckInEvents =
                eventRepository.findRecentAlignerCheckInEvents(doctorId, doctorId, patientId, limit);

        List<AlignerCheckInUpdate> progressPhotos = new ArrayList<>();
        Optional<Patient> patient = Optional.empty();

        for (Event event : recentCheckInEvents) {
            if (event.getType() == EventType.ALIGNER_CHECK_IN) {
                var metadata = (AlignerCheckInEventMetadata) event.getMetadata();

                if (patient.isEmpty()) {
                    patient = profileService.getPatientForTimeline(metadata.getPatientId());
                }

                if (patient.isPresent()) {
                    try {
                        var action = alignerActionRepository
                                .findById(metadata.getAlignerActionId())
                                .orElseThrow(() -> new AlignerActionNotFoundException(metadata.getAlignerActionId()));

                        var checkInDetails = (AlignerCheckInMetadata) action.getMetadata();
                        var feedbacks = alignerFeedbackRepository.findAllById(checkInDetails.getAlignerFeedbackIds());
                        var photos = alignerPhotoRepository.findAllById(checkInDetails.getAlignerPhotoIds());

                        AlignerCheckInUpdate update =
                                AlignerCheckInUpdate.from(event, patient.get(), action, feedbacks, photos);
                        progressPhotos.add(update);
                    } catch (Exception e) {
                        log.warn(
                                "Failed to process aligner check-in event {} for patient {}",
                                event.getId(),
                                metadata.getPatientId(),
                                e);
                    }
                }
            }
        }

        progressPhotos.sort(
                Comparator.comparing(AlignerCheckInUpdate::getEventAt).reversed());

        return ProgressPhotoResponse.from(progressPhotos, recentCheckInEvents.size(), limit);
    }
}
