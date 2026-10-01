package com.dentalstack.patient.feature.appointment.service.impl;

import static com.dentalstack.patient.feature.storage.files.service.FilesService.BRACES_FOLDER_NAME;

import com.amazonaws.services.kms.model.NotFoundException;
import com.dentalstack.patient.feature.appointment.dto.AppointmentDetails;
import com.dentalstack.patient.feature.appointment.dto.CreateAppointmentRequest;
import com.dentalstack.patient.feature.appointment.dto.UpdateAppointmentRequest;
import com.dentalstack.patient.feature.appointment.entity.Appointment;
import com.dentalstack.patient.feature.appointment.entity.AppointmentReminder;
import com.dentalstack.patient.feature.appointment.enums.AppointmentStatus;
import com.dentalstack.patient.feature.appointment.exception.AppointmentNotFoundException;
import com.dentalstack.patient.feature.appointment.repository.AppointmentReminderRepository;
import com.dentalstack.patient.feature.appointment.repository.AppointmentRepository;
import com.dentalstack.patient.feature.appointment.service.AppointmentService;
import com.dentalstack.patient.feature.braces.exception.BracesNotFoundException;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.WhatsAppRequestBuilder;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.util.XOrganizationNameResolver;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.reminder.entity.CustomAppointmentReminderMetadata;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.exception.ReminderNotFoundException;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderHierarchyRequest;
import com.dentalstack.patient.feature.storage.files.dto.UploadFilesRequest;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.service.DraftFileService;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.subcription.exception.StorageLimitExceededException;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.AppointmentEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.AppointmentReminderEventMetadata;
import com.dentalstack.patient.feature.timeline.repository.EventRepository;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.dentalstack.patient.global.exception.BusinessException;
import jakarta.annotation.Nullable;
import java.nio.file.Paths;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final AppointmentReminderRepository appointmentReminderRepository;
    private final BracesJourneyRepository bracesJourneyRepository;

    private final FilesService filesService;
    private final TimelineService timelineService;
    private final EventRepository eventRepository;
    private final DraftFileService draftFileService;
    private final SubscriptionService subscriptionService;
    private final ReminderRepository reminderRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final PatientRepository patientRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final DoctorService doctorService;
    private final ChatService chatService;
    private final WhatsAppRequestBuilder whatsAppRequestBuilder;
    private final XOrganizationNameResolver xOrgNameResolver;
    public static final String APPOINTMENT_FOLDER_NAME = "Appointment";

    @Override
    @Transactional
    public AppointmentDetails createAppointment(CreateAppointmentRequest request, MultipartFile[] files) {
        var doctorId = request.getDoctorId();
        var patientId = request.getPatientId();

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        PatientDoctorOrganization patientDoctorOrganization =
                patientDoctorOrganizationRepository.findByPatientIdAndDoctorId(
                        request.getPatientId(), request.getDoctorId());

        if (patientDoctorOrganization == null) {
            throw new NotFoundException("No organization found for the given patient and doctor.");
        }

        var subscriptionResponse = subscriptionService.getSubSubscriptionDetails(
                doctorId, patientDoctorOrganization.getUserProfile().getId());

        if (subscriptionResponse != null && files != null && files.length > 0) {
            double totalStorageGb = subscriptionResponse.getTotalStorageGb();
            double usedStorageMb = subscriptionResponse.getUsedStorageGb();
            long usedStorageBytes = (long) (usedStorageMb * 1_048_576L);

            long totalFilesSizeBytes = 0;
            for (MultipartFile file : files) {
                totalFilesSizeBytes += file.getSize();
            }

            long totalStorageBytes = (long) (totalStorageGb * 1_073_741_824L);

            if (usedStorageBytes + totalFilesSizeBytes > totalStorageBytes) {
                throw new StorageLimitExceededException(request.getDoctorId());
            }
        }

        var bracesJourney = bracesJourneyRepository
                .findById(request.getBracesJourneyId())
                .orElseThrow(() -> new BracesNotFoundException(request.getBracesJourneyId()));

        bracesJourney.setIsTreatmentStarted(true);
        var reminderId = request.getReminderId();
        var reminder =
                reminderRepository.findById(reminderId).orElseThrow(() -> new ReminderNotFoundException(reminderId));
        Appointment appointment = Appointment.from(request, bracesJourney, bracesJourney.getPatient(), reminder);
        appointment = appointmentRepository.save(appointment);
        var metadata = (CustomAppointmentReminderMetadata) reminder.getMetadata();
        metadata.setIsBracesNotesAdded(true);
        metadata.setAppointmentId(appointment.getId());
        if (patient.getPracticeLocationId() != null) {
            metadata.setPracticeLocationId(patient.getPracticeLocationId());
        }
        if (patient.getPracticeLocationName() != null) {
            metadata.setPracticeLocationName(patient.getPracticeLocationName());
        }
        reminderRepository.save(reminder);

        if (files != null && files.length > 0) {
            if (request.getStatus().equals(AppointmentStatus.DRAFT)) {
                try {
                    var draftFiles = draftFileService.uploadFiles(
                            patientId,
                            UserType.PATIENT,
                            doctorId,
                            UserType.DOCTOR,
                            Paths.get(String.valueOf(appointment.getId())).toString(),
                            files);
                    appointment.setDraftFiles(draftFiles);
                } catch (Exception e) {
                    log.error("Error while uploading draft files for appointment {}", appointment.getId(), e);
                    throw new BadRequestException("Failed to upload draft files. Please try again.");
                }
            } else {
                addFiles(appointment, files);
            }
        }
        appointment = appointmentRepository.save(appointment);

        timelineService.addEvent(
                patientId,
                UserType.PATIENT,
                request.getDoctorId(),
                UserType.DOCTOR,
                EventType.PATIENT_APPOINTMENT_ADDED,
                new AppointmentEventMetadata(
                        PatientDetails.from(bracesJourney.getPatient()),
                        appointment.getId(),
                        appointment.getStartDate()));

        timelineService.addEvent(
                request.getDoctorId(),
                UserType.DOCTOR,
                patientId,
                UserType.PATIENT,
                EventType.PATIENT_APPOINTMENT_ADDED,
                new AppointmentEventMetadata(
                        PatientDetails.from(bracesJourney.getPatient()),
                        appointment.getId(),
                        appointment.getStartDate()));

        List<AppointmentReminder> appointmentReminders = appointmentReminderRepository.findByBracesJourneyIdAndDate(
                bracesJourney.getId(), request.getStartDate().toLocalDate());
        if (!appointmentReminders.isEmpty()) {
            for (AppointmentReminder appointmentReminder : appointmentReminders) {
                appointmentReminder.setReminderStatus(ReminderStatus.INACTIVE);
                appointmentReminderRepository.save(appointmentReminder);
            }
        }

        return AppointmentDetails.from(appointment);
    }

    public static String getFormattedDate(ZonedDateTime date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        return date.format(formatter);
    }

    @Override
    @Transactional(readOnly = true)
    public Appointment getAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository
                .findByIdAndStatusIn(appointmentId, List.of(AppointmentStatus.DRAFT, AppointmentStatus.ACTIVE))
                .orElseThrow(() -> new AppointmentNotFoundException(appointmentId));

        appointment.getJaws().size();
        appointment.getFiles().forEach(f -> f.getChildrenFiles().size());
        return appointment;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> getAppointment(long doctorId, @Nullable Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndPatientIdAndStatusIn(
                doctorId, patientId, List.of(AppointmentStatus.DRAFT, AppointmentStatus.ACTIVE));

        appointments.forEach(a -> a.getJaws().size());
        appointments.forEach(a -> a.getFiles().forEach(f -> f.getChildrenFiles().size()));

        appointments.sort(Comparator.comparing(Appointment::getStartDate).reversed());
        return appointments;
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public void deleteAppointment(long appointmentId) {
        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(appointmentId));
        appointment.setStatus(AppointmentStatus.DELETED);
        appointmentRepository.save(appointment);

        reminderRepository.findActiveReminderByAppointmentId(appointmentId).ifPresent(reminder -> {
            reminder.setStatus(ReminderStatus.INACTIVE);
            reminderRepository.save(reminder);
            log.info("Inactivated reminder {} associated with deleted appointment {}", reminder.getId(), appointmentId);
        });

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(appointment.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(appointment.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        eventRepository
                .findByUserIdAndUserTypeAndForUserIdAndForUserTypeAndActiveAndType(
                        appointment.getPatient().getId(),
                        UserType.PATIENT,
                        appointment.getDoctorId(),
                        UserType.DOCTOR,
                        true,
                        EventType.PATIENT_APPOINTMENT_ADDED)
                .forEach(event -> {
                    event.setActive(false);
                    eventRepository.save(event);
                });

        log.info("Deleted the appointment with id {}", appointmentId);
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public Appointment updateAppointment(UpdateAppointmentRequest request) {
        var appointmentId = request.getAppointmentId();
        Appointment appointment = appointmentRepository
                .findByIdWithEagerLoading(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(appointmentId));

        appointment.getFiles().forEach(f -> f.getChildrenFiles().size());

        Appointment finalAppointment = appointment;
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(appointment.getPatient().getId())
                .orElseThrow(() -> new PatientNotFoundException(
                        finalAppointment.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        if (request.getStatus().equals(AppointmentStatus.ACTIVE)) {
            moveDraftToFiles(appointment);
        }

        appointment.update(request);
        log.info("Updated the appointment with id {}", appointmentId);
        appointment = appointmentRepository.save(appointment);

        appointment.getFiles().size();
        appointment.getJaws().size();
        appointment.getDraftFiles().size();
        if (appointment.getReminder() != null) {
            appointment.getReminder().getId();
        }
        if (appointment.getBracesJourney() != null) {
            appointment.getBracesJourney().getId();
        }

        return appointment;
    }

    private void moveDraftToFiles(Appointment appointment) {
        createDefaultFolder(appointment);
        String treatmentNamePath = appointment.getBracesJourney().getTreatmentName();
        var dateFolderName = getFormattedDate(appointment.getStartDate());
        String fullPath =
                Paths.get(BRACES_FOLDER_NAME, treatmentNamePath, dateFolderName).toString();
        var files = draftFileService.moveDraftToFiles(
                appointment.getDraftFiles(), fullPath, appointment.getPatient().getId());

        log.info("Moved all the draft files to patients files for appointment {}", appointment.getId());
        appointment.getFiles().addAll(files);
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public Appointment addFiles(long appointmentId, long doctorId, MultipartFile[] files) {
        var appointment = appointmentRepository
                .findByIdWithEagerLoading(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(appointmentId));

        appointment.getFiles().forEach(f -> f.getChildrenFiles().size());

        removeDuplicateFiles(appointment);

        PatientDoctorOrganization patientDoctorOrganization =
                patientDoctorOrganizationRepository.findByPatientIdAndDoctorId(
                        appointment.getPatient().getId(), doctorId);

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(appointment.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(appointment.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        if (patientDoctorOrganization == null) {
            throw new NotFoundException("No organization found for the given patient and doctor.");
        }

        var subscriptionResponse = subscriptionService.getSubSubscriptionDetails(
                doctorId, patientDoctorOrganization.getUserProfile().getId());

        if (subscriptionResponse != null) {
            double totalStorageGb = subscriptionResponse.getTotalStorageGb();
            double usedStorageMb = subscriptionResponse.getUsedStorageGb();
            long usedStorageBytes = (long) (usedStorageMb * 1_048_576L);

            long totalFilesSizeBytes = 0;
            for (MultipartFile file : files) {
                totalFilesSizeBytes += file.getSize();
            }
            long totalStorageBytes = (long) (totalStorageGb * 1_073_741_824L);

            if (usedStorageBytes + totalFilesSizeBytes > totalStorageBytes) {
                throw new StorageLimitExceededException(doctorId);
            }
        }

        if (appointment.getDoctorId() != doctorId) {
            throw new BadRequestException(
                    String.format("Appointment is not created by the doctor with id %s", doctorId));
        }

        addFilesToAppointment(appointment, files);

        appointment.getJaws().size();
        appointment.getDraftFiles().size();
        if (appointment.getReminder() != null) {
            appointment.getReminder().getId();
        }
        if (appointment.getBracesJourney() != null) {
            appointment.getBracesJourney().getId();
        }

        return appointment;
    }

    private void removeDuplicateFiles(Appointment appointment) {
        List<File> fileList = appointment.getFiles();

        if (fileList.isEmpty()) {
            return;
        }

        Set<Long> seenIds = new HashSet<>();
        List<File> uniqueFiles = new ArrayList<>();

        for (File file : fileList) {
            if (seenIds.add(file.getId())) {

                uniqueFiles.add(file);
            } else {

                log.warn("Removing duplicate file ID {} from appointment {}", file.getId(), appointment.getId());
            }
        }

        if (fileList.size() != uniqueFiles.size()) {
            log.info(
                    "Cleaned {} duplicate files from appointment {}. Before: {}, After: {}",
                    fileList.size() - uniqueFiles.size(),
                    appointment.getId(),
                    fileList.size(),
                    uniqueFiles.size());

            fileList.clear();
            fileList.addAll(uniqueFiles);
        }

        log.debug(
                "Files in appointment {} after cleanup: {}",
                appointment.getId(),
                appointment.getFiles().stream().map(File::getId).collect(Collectors.toList()));
    }

    private void addFilesToAppointment(Appointment appointment, MultipartFile[] files) {
        createAppointmentFolders(appointment);

        Set<Long> existingFileIds =
                appointment.getFiles().stream().map(File::getId).collect(Collectors.toSet());

        log.info("Existing file IDs before upload: {}", existingFileIds);

        var doctorId = UserId.builder()
                .userId(appointment.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(appointment.getPatient().getId())
                .userType(UserType.PATIENT)
                .build();
        var dateFolderName = getFormattedDate(appointment.getStartDate());

        var uploadDetails = filesService.uploadFiles(
                new UploadFilesRequest(
                        Paths.get("/", BRACES_FOLDER_NAME, APPOINTMENT_FOLDER_NAME, dateFolderName)
                                .toString(),
                        doctorId,
                        Set.of(doctorId, patientId)),
                files,
                false);

        if (!uploadDetails.getFailedToUpload().isEmpty()) {
            log.warn(
                    "Failed to upload {} files",
                    uploadDetails.getFailedToUpload().size());
        }

        if (uploadDetails.getUploadFiles().isEmpty()) {
            log.info("No files were uploaded successfully");
            return;
        }

        List<Long> uploadedFileIds =
                uploadDetails.getUploadFiles().stream().map(File::getId).collect(Collectors.toList());
        log.info("Files returned from upload service: {}", uploadedFileIds);

        List<File> newFiles = uploadDetails.getUploadFiles().stream()
                .filter(file -> {
                    boolean alreadyExists = existingFileIds.contains(file.getId());
                    if (alreadyExists) {
                        log.warn(
                                "SKIPPING: File ID {} already exists in appointment {}. "
                                        + "This file was probably uploaded before or filesService is returning duplicates.",
                                file.getId(),
                                appointment.getId());
                    }
                    return !alreadyExists;
                })
                .toList();

        if (!newFiles.isEmpty()) {
            log.info(
                    "Adding {} NEW files to appointment {}: {}",
                    newFiles.size(),
                    appointment.getId(),
                    newFiles.stream().map(File::getId).collect(Collectors.toList()));

            for (File file : newFiles) {
                if (!appointment.getFiles().contains(file)) {
                    appointment.getFiles().add(file);
                } else {
                    log.warn(
                            "File {} was in newFiles list but already in appointment.getFiles()! Skipping.",
                            file.getId());
                }
            }
        } else {
            log.warn(
                    "NO NEW FILES TO ADD! All {} uploaded files already exist in appointment {}",
                    uploadedFileIds.size(),
                    appointment.getId());
        }

        log.info("Final file count in appointment: {}", appointment.getFiles().size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentOfDoctor(long doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndStatusIn(
                doctorId, List.of(AppointmentStatus.DRAFT, AppointmentStatus.ACTIVE));

        appointments.forEach(a -> a.getJaws().size());
        appointments.forEach(a -> a.getFiles().forEach(f -> f.getChildrenFiles().size()));

        appointments.sort(Comparator.comparing(Appointment::getStartDate).reversed());
        return appointments;
    }

    @Override
    public void todayAppointmentReminder() {

        ZonedDateTime currentDateTime = ZonedDateTime.now();
        String appointmentStatus = String.valueOf(AppointmentStatus.ACTIVE);
        appointmentRepository
                .findByStartDateDateAndStatus(currentDateTime.toLocalDate(), appointmentStatus)
                .forEach(this::todayAppointmentReminder);
    }

    public void todayAppointmentReminder(Appointment appointment) {
        ZonedDateTime currentDateTime = ZonedDateTime.now();

        ZonedDateTime currentAppointmentDate = appointment.getStartDate();
        if (currentAppointmentDate != null
                && currentAppointmentDate.toLocalDate().isEqual(currentDateTime.toLocalDate())) {

            var doctorDetails = doctorService.getDoctor(appointment.getDoctorId());

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title("Today's appointments")
                    .message("You have appointments scheduled for today. Tap to view the list.")
                    .notificationIndex(60)
                    .mobile(doctorDetails.getMobile())
                    .isDoctorApp(true)
                    .email(doctorDetails.getEmail())
                    .xOrgName(xOrgNameResolver
                            .resolveFromDoctorDetails(doctorDetails)
                            .getXOrgName())
                    .organizationId(xOrgNameResolver
                            .resolveFromDoctorDetails(doctorDetails)
                            .getOrganizationId())
                    .build());
            timelineService.addEvent(
                    appointment.getPatient().getId(),
                    UserType.PATIENT,
                    appointment.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.APPOINTMENT_REMINDER,
                    new AppointmentReminderEventMetadata(
                            appointment.getPatient().getId()));

            log.info("Sent today's appointment reminders: {}", appointment.getId());
        }
    }

    private void createAppointmentFolders(Appointment appointment) {
        var doctorId = UserId.builder()
                .userId(appointment.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(appointment.getPatient().getId())
                .userType(UserType.PATIENT)
                .build();

        var dateFolderName = getFormattedDate(appointment.getStartDate());
        filesService.createFolderHierarchy(CreateFolderHierarchyRequest.builder()
                .path(Paths.get("/", BRACES_FOLDER_NAME, APPOINTMENT_FOLDER_NAME, dateFolderName)
                        .toString())
                .uploader(patientId)
                .owners(Set.of(doctorId, patientId))
                .isDefaultFolder(true)
                .isPatientFolder(true)
                .build());
    }

    private void addFiles(Appointment appointment, MultipartFile[] files) {
        createAppointmentFolders(appointment);

        var doctorId = UserId.builder()
                .userId(appointment.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(appointment.getPatient().getId())
                .userType(UserType.PATIENT)
                .build();
        var dateFolderName = getFormattedDate(appointment.getStartDate());
        var uploadDetails = filesService.uploadFiles(
                new UploadFilesRequest(
                        Paths.get("/", BRACES_FOLDER_NAME, APPOINTMENT_FOLDER_NAME, dateFolderName)
                                .toString(),
                        doctorId,
                        Set.of(doctorId, patientId)),
                files,
                false);

        if (!uploadDetails.getFailedToUpload().isEmpty()) {
            log.warn(
                    "Failed to upload {} files",
                    uploadDetails.getFailedToUpload().size());
        }

        Set<Long> existingFileIds =
                appointment.getFiles().stream().map(File::getId).collect(Collectors.toSet());

        log.debug("Existing file IDs in appointment {}: {}", appointment.getId(), existingFileIds);

        List<File> newFiles = uploadDetails.getUploadFiles().stream()
                .filter(file -> {
                    boolean exists = existingFileIds.contains(file.getId());
                    if (exists) {
                        log.warn(
                                "File with ID {} already exists in appointment {}. Skipping.",
                                file.getId(),
                                appointment.getId());
                    }
                    return !exists;
                })
                .toList();

        if (!newFiles.isEmpty()) {
            log.info("Adding {} new files to appointment {}", newFiles.size(), appointment.getId());
            appointment.getFiles().addAll(newFiles);
        } else {
            log.info("No new files to add. All uploaded files already exist in appointment {}", appointment.getId());
        }
    }

    private void createDefaultFolder(Appointment appointment) {
        var doctorId = UserId.builder()
                .userId(appointment.getBracesJourney().getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(appointment.getPatient().getId())
                .userType(UserType.PATIENT)
                .build();

        String treatmentNamePath = appointment.getBracesJourney().getTreatmentName();
        var dateFolderName = getFormattedDate(appointment.getStartDate());
        filesService.createFolderHierarchy(CreateFolderHierarchyRequest.builder()
                .path(Paths.get("/", BRACES_FOLDER_NAME, treatmentNamePath, dateFolderName)
                        .toString())
                .uploader(patientId)
                .owners(Set.of(doctorId, patientId))
                .isDefaultFolder(true)
                .isPatientFolder(true)
                .build());
    }
}
