package com.dentalstack.patient.feature.braces.service.impl;

import com.dentalstack.patient.feature.aligner.exception.aligner.AlignerJourneyNotFoundException;
import com.dentalstack.patient.feature.appointment.dto.reminder.CustomAppointmentReminderResponse;
import com.dentalstack.patient.feature.appointment.entity.AppointmentReminder;
import com.dentalstack.patient.feature.appointment.repository.AppointmentReminderRepository;
import com.dentalstack.patient.feature.braces.dto.BracesJourneyDetails;
import com.dentalstack.patient.feature.braces.dto.CreateBracesJourneyRequest;
import com.dentalstack.patient.feature.braces.dto.FilterBracesJourneysRequest;
import com.dentalstack.patient.feature.braces.dto.UpdateBracesJourneyRequest;
import com.dentalstack.patient.feature.braces.dto.app.BracesAppDashboardDetails;
import com.dentalstack.patient.feature.braces.dto.app.ReportBracesIssueRequest;
import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.braces.entity.BracesJourneyIssue;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.braces.exception.BracesNotFoundException;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.braces.service.BracesJourneyService;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.exception.NoPatientAddedException;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.payment.dto.payments.TreatmentPaymentsDetails;
import com.dentalstack.patient.feature.payment.service.PaymentService;
import com.dentalstack.patient.feature.producttype.entity.Product;
import com.dentalstack.patient.feature.producttype.repository.ProductRepository;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderPurpose;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.storage.drive.async.DriveAsyncHelper;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderHierarchyRequest;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.BracesJourneyEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.ProductTypeAddedEventMetaData;
import com.dentalstack.patient.feature.timeline.repository.EventRepository;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.dentalstack.patient.global.exception.BusinessException;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BracesJourneyServiceImpl implements BracesJourneyService {

    private final PatientRepository patientRepository;
    private final BracesJourneyRepository bracesJourneyRepository;
    private final AppointmentReminderRepository appointmentReminderRepository;
    private final TimelineService timelineService;
    private final EventRepository eventRepository;
    private final FilesService filesService;
    private final DriveAsyncHelper driveAsyncHelper;
    private final PaymentService paymentService;
    private final ReminderRepository reminderRepository;
    private final ProductRepository productRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final UserProfileRepository userProfileRepository;
    public final String BRACES_FOLDER_NAME = "Braces";
    private final DashboardCacheEvictService dashboardCacheEvictService;

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public BracesJourneyDetails createBracesJourney(CreateBracesJourneyRequest request) {
        var patientId = request.getPatientId();

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        if (!patient.getProductTypeNames().contains(ProductTypeName.BRACES)) {
            patient.getProductTypeNames().add(ProductTypeName.BRACES);
            patient.setProductTypeName(ProductTypeName.BRACES);
            patientRepository.save(patient);

            Product product = Product.from(request);
            productRepository.save(product);

            timelineService.addEvent(
                    request.getDoctorId(),
                    UserType.DOCTOR,
                    patient.getId(),
                    UserType.PATIENT,
                    EventType.PRODUCT_TYPE_ADDED,
                    new ProductTypeAddedEventMetaData(PatientDetails.from(patient), ProductTypeName.BRACES));

            log.info("Added treatment for patient_id: {}", request.getPatientId());
        }

        List<BracesJourney> bracesJourneys = bracesJourneyRepository.findByPatientId(request.getPatientId());
        for (BracesJourney bracesJourney : bracesJourneys) {
            bracesJourney.setBracesTreatmentStage(BracesTreatmentStage.INACTIVE);
            bracesJourneyRepository.save(bracesJourney);
        }
        var newBracesJourney = BracesJourney.newTreatment(request, patient);
        patient.setProductTypeName(request.getProductTypeName());

        if (request.getBracesTreatmentStage().equals(BracesTreatmentStage.ACTIVE)) {
            newBracesJourney.setDoctorTreatmentStartDate(LocalDate.now());
        }

        patientRepository.save(patient);
        var bracesJourney = bracesJourneyRepository.save(newBracesJourney);
        createDefaultFolder(request, patient);

        timelineService.addEvent(
                patient.getId(),
                UserType.PATIENT,
                request.getDoctorId(),
                UserType.DOCTOR,
                EventType.BRACES_JOURNEY_CREATED,
                new BracesJourneyEventMetadata(PatientDetails.from(bracesJourney.getPatient())));

        return BracesJourneyDetails.from(bracesJourney);
    }

    private void createDefaultFolder(CreateBracesJourneyRequest request, Patient patient) {
        var doctorId = UserId.builder()
                .userId(request.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(request.getPatientId())
                .userType(UserType.PATIENT)
                .build();
        String treatmentPlanFolderPath =
                Paths.get("/", BRACES_FOLDER_NAME, request.getTreatmentName()).toString();
        driveAsyncHelper.createFolderHierarchiesAsync(
                List.of(CreateFolderHierarchyRequest.builder()
                        .path(treatmentPlanFolderPath)
                        .uploader(patientId)
                        .owners(Set.of(patientId, doctorId))
                        .isDefaultFolder(true)
                        .isPatientFolder(true)
                        .build()),
                "Braces folder for patient " + request.getPatientId());
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public BracesJourneyDetails updateBracesJourney(UpdateBracesJourneyRequest request) {
        final long bracesJourneyId = request.getBracesJourneyId();
        BracesJourney bracesJourney = bracesJourneyRepository
                .findById(bracesJourneyId)
                .orElseThrow(() -> new BracesNotFoundException(bracesJourneyId));

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(bracesJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(bracesJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        BracesJourney bracesJourneyUpdate = BracesJourney.updateBracesJourney(request, bracesJourney);
        if (request.getBracesTreatmentStage().equals(BracesTreatmentStage.ACTIVE)
                && bracesJourney.getBracesTreatmentStage().equals(BracesTreatmentStage.DRAFT)) {
            bracesJourneyUpdate.setDoctorTreatmentStartDate(LocalDate.now());
        }
        bracesJourneyRepository.save(bracesJourneyUpdate);
        return BracesJourneyDetails.from(bracesJourneyRepository.save(bracesJourneyUpdate));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BracesJourneyDetails> getBracesJourney(Long bracesJourneyId) {
        List<AppointmentReminder> appointmentReminders =
                appointmentReminderRepository.findByBracesJourneyId(bracesJourneyId);

        LocalDate nextAppointmentDate = getNextAppointmentDate(appointmentReminders.stream()
                .filter(reminder -> reminder.getReminderStatus() == ReminderStatus.ACTIVE)
                .collect(Collectors.toList()));
        var bracesJourney = bracesJourneyRepository
                .findById(bracesJourneyId)
                .orElseThrow(() -> new BracesNotFoundException(bracesJourneyId));
        var lastAppointment = bracesJourney.getLastAppointment();

        List<BracesJourneyDetails> bracesJourneyDetails = new ArrayList<>();
        boolean isAppointmentFilled = !bracesJourney.getAppointments().isEmpty();
        boolean isReminderFilled = !appointmentReminders.isEmpty();

        if (lastAppointment != null) {
            bracesJourneyDetails.add(BracesJourneyDetails.from(
                    bracesJourney, nextAppointmentDate, lastAppointment, isAppointmentFilled, isReminderFilled));
        } else {
            bracesJourneyDetails.add(BracesJourneyDetails.from(
                    bracesJourney, nextAppointmentDate, null, isAppointmentFilled, isReminderFilled));
        }
        return bracesJourneyDetails;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BracesJourneyDetails> getBracesJourneyDetails(Long doctorId, BracesTreatmentStage status) {
        List<BracesJourney> bracesJourneys =
                bracesJourneyRepository.findByDoctorIdAndBracesTreatmentStage(doctorId, status);
        if (!bracesJourneys.isEmpty()) {
            List<BracesJourneyDetails> bracesJourneyDetails = new ArrayList<>();
            for (BracesJourney bracesJourney : bracesJourneys) {
                List<AppointmentReminder> appointmentReminders =
                        appointmentReminderRepository.findByBracesJourneyId(bracesJourney.getId());

                var lastAppointment = bracesJourney.getLastAppointment();

                var nextAppointment = bracesJourney.getUpcomingAppointment();
                var nextAppointmentDate =
                        nextAppointment != null ? nextAppointment.getStartDate().toLocalDate() : null;
                boolean isAppointmentFilled = !bracesJourney.getAppointments().isEmpty();
                boolean isReminderFilled = !appointmentReminders.isEmpty();

                if (lastAppointment != null) {
                    bracesJourneyDetails.add(BracesJourneyDetails.from(
                            bracesJourney,
                            nextAppointmentDate,
                            lastAppointment,
                            isAppointmentFilled,
                            isReminderFilled));
                } else {
                    bracesJourneyDetails.add(BracesJourneyDetails.from(
                            bracesJourney, nextAppointmentDate, null, isAppointmentFilled, isReminderFilled));
                }
            }
            return bracesJourneyDetails.stream()
                    .filter(details -> details.isAppointmentFilled() || details.isReminderFilled())
                    .collect(Collectors.toList());
        } else {
            throw new NoPatientAddedException(doctorId, status);
        }
    }

    @Override
    @Transactional(readOnly = true)
    @Deprecated
    public List<BracesJourneyDetails> getBracesJourneyDetailsForWeb(Long doctorId, BracesTreatmentStage status) {
        return getBracesJourneyDetailsForOrganization(doctorId, status, 0L, 0L);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BracesJourneyDetails> getBracesJourneyDetailsForOrganization(
            Long doctorId, BracesTreatmentStage status, long profileId, long organizationId) {
        List<BracesJourney> bracesJourneys = getPatientsByRole(doctorId, status, profileId, organizationId);

        if (!bracesJourneys.isEmpty()) {
            List<BracesJourneyDetails> bracesJourneyDetails = new ArrayList<>();
            for (BracesJourney bracesJourney : bracesJourneys) {
                List<AppointmentReminder> appointmentReminders =
                        appointmentReminderRepository.findByBracesJourneyId(bracesJourney.getId());

                boolean isAppointmentFilled = !bracesJourney.getAppointments().isEmpty();
                boolean isReminderFilled = !appointmentReminders.isEmpty();

                if (!isAppointmentFilled) {
                    continue;
                }

                var lastAppointment = bracesJourney.getLastAppointment();

                var nextAppointment = bracesJourney.getUpcomingAppointment();
                var nextAppointmentDate =
                        nextAppointment != null ? nextAppointment.getStartDate().toLocalDate() : null;

                if (lastAppointment != null) {
                    bracesJourneyDetails.add(BracesJourneyDetails.from(
                            bracesJourney, nextAppointmentDate, lastAppointment, true, isReminderFilled));
                } else {
                    bracesJourneyDetails.add(BracesJourneyDetails.from(
                            bracesJourney, nextAppointmentDate, null, true, isReminderFilled));
                }
            }
            return bracesJourneyDetails;
        } else {
            throw new NoPatientAddedException(doctorId, status);
        }
    }

    private List<BracesJourney> getPatientsByRole(
            Long doctorId, BracesTreatmentStage status, long profileId, long organizationId) {
        if (profileId == 0L || organizationId == 0L) {
            return bracesJourneyRepository.findByDoctorIdAndBracesTreatmentStage(doctorId, status);
        }
        UserProfile userProfile =
                userProfileRepository.findByIdWithRoles(profileId).orElseThrow(DoctorNotFoundException::new);

        List<Long> patientIds;
        if (UserProfile.isAlignerCompanyOrLab(userProfile.getRoles())
                || UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
            patientIds = patientDoctorOrganizationRepository.findPatientIdsByOrganizationId(organizationId);
        } else {
            patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfile(
                    doctorId, organizationId, profileId);
        }
        return bracesJourneyRepository.findByPatientIdsAndBracesTreatmentStage(patientIds, status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BracesJourneyDetails> getBracesJourneyDetailsForDashboard(Long doctorId) {

        List<BracesTreatmentStage> statusList = Arrays.asList(BracesTreatmentStage.DRAFT, BracesTreatmentStage.ACTIVE);

        List<BracesJourney> bracesJourneys =
                bracesJourneyRepository.findByDoctorIdAndBracesTreatmentStageIn(doctorId, statusList);
        if (!bracesJourneys.isEmpty()) {
            List<BracesJourneyDetails> bracesJourneyDetails = new ArrayList<>();
            for (BracesJourney bracesJourney : bracesJourneys) {
                List<AppointmentReminder> appointmentReminders =
                        appointmentReminderRepository.findByBracesJourneyId(bracesJourney.getId());

                LocalDate nextAppointmentDate = getNextAppointmentDate(appointmentReminders.stream()
                        .filter(reminder -> reminder.getReminderStatus() == ReminderStatus.ACTIVE)
                        .collect(Collectors.toList()));
                var lastAppointment = bracesJourney.getLastAppointment();

                boolean isReminderFilled = !appointmentReminders.isEmpty();

                boolean isAppointmentFilled = !bracesJourney.getAppointments().isEmpty();

                if (lastAppointment != null) {
                    bracesJourneyDetails.add(BracesJourneyDetails.from(
                            bracesJourney,
                            nextAppointmentDate,
                            lastAppointment,
                            isAppointmentFilled,
                            isReminderFilled));
                } else {
                    bracesJourneyDetails.add(BracesJourneyDetails.from(
                            bracesJourney, nextAppointmentDate, null, isAppointmentFilled, isReminderFilled));
                }
            }
            return bracesJourneyDetails;
        } else {
            throw new NoPatientAddedException(doctorId, BracesTreatmentStage.ACTIVE);
        }
    }

    @Override
    public void startTreatment(boolean isTreatmentStarted, Long patientId) {
        var bracesJourney = bracesJourneyRepository
                .findByPatientIdAndBracesTreatmentStage(patientId, BracesTreatmentStage.ACTIVE)
                .orElseThrow(() -> new BracesNotFoundException(patientId, UserType.PATIENT));
        bracesJourney.setIsTreatmentStarted(true);

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(bracesJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(bracesJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        bracesJourneyRepository.save(bracesJourney);
    }

    @Override
    public BracesJourney discardBracesJourney(Long bracesJourneyId) {
        BracesJourney bracesJourney = bracesJourneyRepository
                .findById(bracesJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(bracesJourneyId));

        bracesJourney.setBracesTreatmentStage(BracesTreatmentStage.DISCARDED);
        bracesJourney.setDoctorTreatmentEndDate(LocalDate.now());
        log.info("Braces journey with id {} is discarded.", bracesJourneyId);

        eventRepository
                .findByUserIdAndUserTypeAndForUserIdAndForUserTypeAndActiveAndType(
                        bracesJourney.getPatient().getId(),
                        UserType.PATIENT,
                        bracesJourney.getDoctorId(),
                        UserType.DOCTOR,
                        true,
                        EventType.BRACES_JOURNEY_CREATED)
                .forEach(event -> {
                    event.setActive(false);
                    eventRepository.save(event);
                });

        return bracesJourneyRepository.save(bracesJourney);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BracesJourneyDetails> getFilteredBracesJourneys(FilterBracesJourneysRequest request) {
        List<BracesJourney> bracesJourneys =
                bracesJourneyRepository.findByDoctorIdAndPatientId(request.getDoctorId(), request.getPatientId());

        Optional<BracesJourney> activeBracesJourney = bracesJourneys.stream()
                .filter(bracesJourney -> bracesJourney.getBracesTreatmentStage() == BracesTreatmentStage.ACTIVE)
                .findFirst();

        Long activeBracesJourneyId = activeBracesJourney.map(BaseEntity::getId).orElse(null);
        var latestPastAppointment =
                getLatestPastAppointment(request.getPatientId(), request.getDoctorId(), activeBracesJourneyId);
        var nextUpcomingAppointment =
                getNextUpcomingAppointment(request.getPatientId(), request.getDoctorId(), activeBracesJourneyId);

        return bracesJourneys.stream()
                .filter(bracesJourney -> request.getBracesTreatmentStage().equals(BracesTreatmentStage.ALL)
                        || bracesJourney.getBracesTreatmentStage().equals(request.getBracesTreatmentStage()))
                .map(bracesJourney -> {
                    List<AppointmentReminder> appointmentReminders =
                            appointmentReminderRepository.findByBracesJourneyId(bracesJourney.getId());

                    LocalDate nextAppointmentDate = getNextAppointmentDate(appointmentReminders.stream()
                            .filter(reminder -> reminder.getReminderStatus() == ReminderStatus.ACTIVE)
                            .collect(Collectors.toList()));

                    var lastAppointment = bracesJourney.getLastAppointment();
                    boolean isAppointmentFilled =
                            !bracesJourney.getAppointments().isEmpty();
                    boolean isReminderFilled = !appointmentReminders.isEmpty();

                    return BracesJourneyDetails.from(
                            bracesJourney,
                            nextAppointmentDate,
                            lastAppointment,
                            isAppointmentFilled,
                            isReminderFilled,
                            latestPastAppointment,
                            nextUpcomingAppointment);
                })
                .collect(Collectors.toList());
    }

    private CustomAppointmentReminderResponse getLatestPastAppointment(
            Long patientId, Long doctorId, Long bracesJourneyId) {
        var reminderStatuses = List.of(ReminderStatus.ACTIVE, ReminderStatus.TRIGGERED);

        Reminder reminder = reminderRepository.findLatestPastAppointmentReminder(
                doctorId, patientId, ReminderPurpose.APPOINTMENT, LocalDate.now(), reminderStatuses);

        if (reminder == null) {
            return null;
        }

        return CustomAppointmentReminderResponse.from(reminder, bracesJourneyId);
    }

    private CustomAppointmentReminderResponse getNextUpcomingAppointment(
            Long patientId, Long doctorId, Long bracesJourneyId) {
        var reminderStatuses = List.of(ReminderStatus.ACTIVE, ReminderStatus.TRIGGERED);

        Reminder reminder = reminderRepository.findNextUpcomingAppointmentReminder(
                doctorId, patientId, ReminderPurpose.APPOINTMENT, LocalDate.now(), reminderStatuses);

        if (reminder == null) {
            return null;
        }

        return CustomAppointmentReminderResponse.from(reminder, bracesJourneyId);
    }

    @Override
    public BracesAppDashboardDetails getBracesAppDashboardDetails(Long patientId) {

        var patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));
        bracesJourneyRepository.findByPatientId(patientId);

        var treatmentPaymentsDetails =
                TreatmentPaymentsDetails.from(paymentService.getTreatment(patientId, patient.getAddedByUserId()));
        var bracesJourney = bracesJourneyRepository
                .findByPatientIdAndBracesTreatmentStage(patientId, BracesTreatmentStage.ACTIVE)
                .orElseThrow(() -> new BracesNotFoundException(patientId, UserType.PATIENT));
        return BracesAppDashboardDetails.from(bracesJourney, treatmentPaymentsDetails);
    }

    @Override
    public void reportIssue(ReportBracesIssueRequest request) {
        var bracesJourney = bracesJourneyRepository
                .findById(request.getBracesJourneyId())
                .orElseThrow(() -> new BracesNotFoundException(request.getBracesJourneyId()));
        var issue = BracesJourneyIssue.bracesJourneyIssue(request.getIssues(), request.getOtherIssues(), bracesJourney);
        bracesJourney.getBracesJourneyIssues().add(issue);
        bracesJourneyRepository.save(bracesJourney);
    }

    public LocalDate getNextAppointmentDate(List<AppointmentReminder> reminders) {
        if (reminders == null || reminders.isEmpty()) {
            return null;
        }
        return reminders.stream()
                .map(AppointmentReminder::getDate)
                .filter(date -> date != null && !date.isBefore(LocalDate.now()))
                .min(LocalDate::compareTo)
                .orElse(null);
    }
}
