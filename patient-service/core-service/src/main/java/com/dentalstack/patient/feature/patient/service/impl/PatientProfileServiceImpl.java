package com.dentalstack.patient.feature.patient.service.impl;

import com.dentalstack.patient.feature.aligner.cache.AlignerCacheEvict;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.repository.CustomAlignerReminderRepository;
import com.dentalstack.patient.feature.aligner.repository.DefaultAlignerReminderRepository;
import com.dentalstack.patient.feature.appointment.entity.Appointment;
import com.dentalstack.patient.feature.appointment.repository.AppointmentRepository;
import com.dentalstack.patient.feature.auth.service.AuthService;
import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.caseinfo.repository.CaseInformationRepository;
import com.dentalstack.patient.feature.caserecord.entity.CaseRecordUserMapping;
import com.dentalstack.patient.feature.caserecord.repository.CaseRecordRepository;
import com.dentalstack.patient.feature.caserecord.repository.CaseRecordUserMappingRepository;
import com.dentalstack.patient.feature.chat.repository.AlignerCheckInRepository;
import com.dentalstack.patient.feature.chat.repository.DoctorChatRepository;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.dto.AlignerDetailsForDoctor;
import com.dentalstack.patient.feature.doctor.dto.PLOfPatientResponse;
import com.dentalstack.patient.feature.doctor.entity.CustomerAccessAndRevoke;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.entity.PracticeLocation;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.exception.NoPatientAddedException;
import com.dentalstack.patient.feature.doctor.exception.PracticeLocationNotFoundException;
import com.dentalstack.patient.feature.doctor.repository.CustomerAccessAndRevokeRepository;
import com.dentalstack.patient.feature.doctor.repository.PracticeLocationRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.invitation.dto.InvitePatientRequest;
import com.dentalstack.patient.feature.invitation.dto.v2.InvitePatientRequestV2;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.entity.PatientInvitationDetails;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.invitation.exception.PatientInvitationNotFoundException;
import com.dentalstack.patient.feature.invitation.repository.InvitationRepository;
import com.dentalstack.patient.feature.invitation.repository.PatientCustomerInvitationRepository;
import com.dentalstack.patient.feature.invitation.repository.PatientInvitationDetailsRepository;
import com.dentalstack.patient.feature.notification.dto.EmailSendReq;
import com.dentalstack.patient.feature.notification.dto.RemoveFilesAndImagesRequest;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.entity.OrderComments;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.order.projection.OrderCountSummary;
import com.dentalstack.patient.feature.order.repository.OrderCommentsRepository;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.patient.dto.*;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.entity.PatientDeletedHistory;
import com.dentalstack.patient.feature.patient.entity.PatientLead;
import com.dentalstack.patient.feature.patient.enums.NextAction;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.patient.exception.*;
import com.dentalstack.patient.feature.patient.repository.*;
import com.dentalstack.patient.feature.patient.service.PatientProfileService;
import com.dentalstack.patient.feature.payment.enums.Status;
import com.dentalstack.patient.feature.prescription.repository.PrescriptionRepository;
import com.dentalstack.patient.feature.producttype.dto.producttype.ProductType;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderPurpose;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.storage.files.dto.DeleteAllOwnerFilesRequest;
import com.dentalstack.patient.feature.storage.files.dto.ToggleStlFileViewRequest;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.s3.AmazonS3Service;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.erp.PatientAddedByPracticeEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.erp.PatientAssignedToPracticeEventMetadata;
import com.dentalstack.patient.feature.timeline.repository.EventRepository;
import com.dentalstack.patient.feature.timeline.service.EventTriggerService;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
import com.dentalstack.patient.feature.tracking.repository.TrackingRepository;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.exception.UserNotFoundException;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.activity.repository.ActivityRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.manufacturing_checklist.repository.ManufacturingBatchCheckListRepository;
import com.dentalstack.patient.feature.workflow.mytask.repository.MyTaskRepository;
import com.dentalstack.patient.feature.workflow.pre_treatment.repository.PatientPreTreatmentRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.entity.Address;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.dentalstack.patient.global.exception.BusinessException;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class PatientProfileServiceImpl implements PatientProfileService {

    private final PatientRepository patientRepository;
    private final AmazonS3Service amazonS3Service;
    private final DoctorService doctorService;

    private final EventRepository eventRepository;
    private final AlignerJourneyRepository alignerJourneyRepository;
    private final ChatService chatService;
    private final PatientInvitationDetailsRepository patientInvitationDetailsRepository;
    private final PatientLeadRepository patientLeadRepository;
    private final CustomAlignerReminderRepository customAlignerReminderRepository;
    private final DefaultAlignerReminderRepository defaultAlignerReminderRepository;
    private final InvitationRepository invitationRepository;
    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final PatientDeletedHistoryRepository patientDeletedHistoryRepository;
    private final BracesJourneyRepository bracesJourneyRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuthService authService;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final ReminderRepository reminderRepository;
    private final TrackingRepository trackingRepository;
    private final AlignerCacheEvict alignerCacheEvict;
    private final PracticeLocationRepository practiceLocationRepository;

    private final FileRepository fileRepository;
    private final CaseInformationRepository caseInformationRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final EventTriggerService eventTriggerService;
    private final OrderRepository orderRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final PrescriptionRepository prescriptionRepository;
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;

    private final ActivityRepository activityRepository;
    private final MyTaskRepository myTaskRepository;
    private final ManufacturingBatchCheckListRepository manufacturingBatchCheckListRepository;
    private final PatientPreTreatmentRepository patientPreTreatmentRepository;
    private final PatientNotesRepository patientNotesRepository;
    private final CaseRecordRepository caseRecordRepository;
    private final OrderCommentsRepository orderCommentsRepository;
    private final PatientCustomerInvitationRepository customerInvitationRepository;
    private final CustomerAccessAndRevokeRepository customerAccessAndRevokeRepository;
    private final CaseRecordUserMappingRepository caseRecordUserMappingRepository;
    private final DoctorChatRepository doctorChatRepository;
    private final AlignerCheckInRepository alignerCheckInRepository;

    @Lazy
    @Autowired
    private SubscriptionService subscriptionService;

    @Value("${dentalstack.jwt.secret.token}")
    private String decodedSecretKey;

    String FILES_FOLDER_NAME = "files";

    @Value("${app.cloud.amazon.s3.bucket.files}")
    private String filesBucket;

    @Value("${app.cloud.amazon.s3.bucket.patient}")
    private String profilePictureBucket;

    @Override
    public Patient registerPatient(RegisterPatientRequest request) {
        var optionalPatient = patientRepository.findByMobileNo(request.getMobile());
        if (optionalPatient.isPresent()) {
            return optionalPatient.get();
        }
        String uuid = generateUUID();
        Patient patient = Patient.from(request, uuid);

        return patientRepository.save(patient);
    }

    private String generateUUID() {
        String uuid;
        do {
            String timeStamp = new SimpleDateFormat("ddHHmmss").format(new Date());
            uuid = "P" + timeStamp;
        } while (patientRepository.findByUUID(uuid).isPresent());
        return uuid;
    }

    @Override
    public Patient registerPatientFromInvitation(Long adminProfileId, InvitePatientRequest request) {
        if (request.getMobile() != null) {
            var optionalPatient = patientRepository.findByMobileNo(request.getMobile());

            if (optionalPatient.isPresent()) {
                if (optionalPatient.get().getPatientStatus().equals(PatientStatus.DELETED)) {
                    return optionalPatient.get();
                }
                throw new PatientAlreadyAssignedToDoctorException(
                        optionalPatient.get().getId(), request.getInviterId());
            }
        }
        String uuid = generateUUID();
        if (request.getEmail() != null) {
            var patientByEmail = patientRepository.findByEmail(request.getEmail());
            if (patientByEmail.isPresent()) {
                if (patientByEmail.get().getPatientStatus().equals(PatientStatus.DELETED)) {
                    return patientByEmail.get();
                }
                throw new PatientAlreadyAssignedToDoctorException(
                        patientByEmail.get().getId(), request.getInviterId());
            }
        }

        if (request.getOrganizationId() != null && request.getProfileId() != null) {
            PatientBelongsTo patientBelongsTo = PatientBelongsTo.NOT_ASSIGNED;

            var userProfile = userProfileRepository
                    .findByIdWithOrgAndDoctor(
                            request.getPracticeProfileId() != null
                                    ? request.getPracticeProfileId()
                                    : request.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getInviterId()));
            boolean isPracticeAssigned = request.getPracticeProfileId() != null;

            if (isPracticeAssigned && request.getProfileId().equals(request.getPracticeProfileId())) {
                if (UserProfile.isAlignerCompanyOrLab(userProfile.getRoles())
                        || UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
                    patientBelongsTo = PatientBelongsTo.ORG_PATIENT;
                } else {
                    patientBelongsTo = PatientBelongsTo.ORTHODONTIC_PATIENT;
                }
            }

            if (isPracticeAssigned && !request.getProfileId().equals(request.getPracticeProfileId())) {
                patientBelongsTo = PatientBelongsTo.ASSIGNED_TO_PRACTICE;
            }

            UserProfile orgUserProfile;
            if (adminProfileId != null) {
                orgUserProfile = userProfileRepository
                        .findByIdWithOrgAndDoctorAndUser(adminProfileId)
                        .orElseThrow(() -> new DoctorNotFoundException(request.getInviterId()));
            } else {
                orgUserProfile = userProfileRepository
                        .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                        .orElseThrow(() -> new DoctorNotFoundException(request.getInviterId()));
            }

            Patient patient = Patient.from(request, uuid);
            patient.setPracticeLocationId(request.getPracticeLocationId());

            UserProfile ownerProfile;
            if (!orgUserProfile.isOwner()) {
                ownerProfile = orgUserProfile.getInviterProfile();
            } else {
                ownerProfile = orgUserProfile;
            }

            PatientDoctorOrganization patientDoctorOrganization = PatientDoctorOrganization.builder()
                    .patient(patient)
                    .doctor(userProfile.getDoctor())
                    .organization(userProfile.getOrganization())
                    .addedByUserProfile(orgUserProfile)
                    .userProfile(userProfile)
                    .active(true)
                    .isPracticeAssigned(isPracticeAssigned)
                    .patientBelongsTo(patientBelongsTo)
                    .orgUserProfile(ownerProfile)
                    .build();

            patient.setDoctorOrganization(patientDoctorOrganization);
            var savedPatient = patientRepository.save(patient);
            if (request.getPracticeProfileId() != null
                    && !request.getPracticeProfileId().equals(request.getProfileId())) {
                chatService.newPatientAssignedToPractice(EmailSendReq.builder()
                        .orderReceiverName(orgUserProfile.getOrgName())
                        .doctorEmail(userProfile.getUser().getEmail())
                        .orgName(orgUserProfile.getOrganizationBrandName())
                        .patientFirstName(patientDoctorOrganization.getPatient().fullName())
                        .build());
                chatService.newPatientAssignedToPracticeNotification(
                        patientDoctorOrganization.getPatient().fullName(),
                        userProfile.getUser().getEmail(),
                        orgUserProfile.getOrgName(),
                        savedPatient.getId());
                eventTriggerService.addEvent(
                        savedPatient.getId(),
                        UserType.PATIENT,
                        userProfile.getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.PATIENT_ASSIGNED_TO_PRACTICE,
                        new PatientAssignedToPracticeEventMetadata(
                                savedPatient.getId(),
                                orgUserProfile.getOrgName(),
                                userProfile.getPracticeName(),
                                patient.getPatientType().name(),
                                patient.getHasReadExistingPatientForm()),
                        userProfile,
                        userProfile.getOrganization());
            }

            var profileType = orgUserProfile.getProfileType().equals(ProfileType.INVITED);

            if (profileType && orgUserProfile.getInviterProfile() != null && orgUserProfile.isPractice()) {
                chatService.addedPatientByPracticeMail(EmailSendReq.builder()
                        .name(orgUserProfile.getUser().fullName())
                        .patientFirstName(patient.fullName())
                        .date(LocalDate.now())
                        .doctorEmail(
                                orgUserProfile.getInviterProfile().getUser().getEmail())
                        .practiceAdminName(orgUserProfile.getPracticeName())
                        .orgName(orgUserProfile.getOrganizationBrandName())
                        .build());
                chatService.notificationForPatientAddedByPractice(
                        orgUserProfile.getInviterProfile().getUser().getEmail(),
                        orgUserProfile.getPracticeName(),
                        savedPatient.getId());
                eventTriggerService.addEvent(
                        savedPatient.getId(),
                        UserType.PATIENT,
                        orgUserProfile.getInviterProfile().getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.PATIENT_ADDED_BY_PRACTICE,
                        new PatientAddedByPracticeEventMetadata(savedPatient.getId(), orgUserProfile.getPracticeName()),
                        orgUserProfile.getInviterProfile(),
                        orgUserProfile.getOrganization());
            }
            return savedPatient;
        }
        Patient patient = Patient.from(request, uuid);
        patient.setPracticeLocationId(request.getPracticeLocationId());
        return patientRepository.save(patient);
    }

    @Override
    public Patient registerPatientFromInvitationV2(Long ownerProfileId, InvitePatientRequestV2 request) {
        checkMobileAndEmailAlreadyExists(request);
        var receiverProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getReceiverProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getReceiverProfileId()));

        var ownerProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(
                        request.getPracticeProfileId() != null
                                ? request.getPracticeProfileId()
                                : request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getInviterId()));

        UserProfile orgUserProfile;
        if (ownerProfileId != null) {
            orgUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(ownerProfileId)
                    .orElseThrow(() -> new DoctorNotFoundException(request.getInviterId()));
        } else {
            orgUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getInviterId()));
        }

        Patient patient = Patient.from(request);

        if (request.getPatientUuid() != null
                && patientRepository.findByUUID(request.getPatientUuid()).isPresent()) {
            throw new BadRequestException("Patient with UUID " + request.getPatientUuid() + " already exists");
        }

        if (request.getPatientUuid() == null) {
            int retries = 0;
            while (patientRepository.findByUUID(patient.getUUID()).isPresent() && retries < 3) {
                patient = Patient.from(request);
                retries++;
            }
        }

        var patientDoctorOrganization =
                PatientDoctorOrganization.from(patient, ownerProfile, receiverProfile, orgUserProfile);

        patient.setDoctorOrganization(patientDoctorOrganization);

        var savedPatient = patientRepository.save(patient);
        if (request.getOrganizationId() != null && request.getProfileId() != null) {
            var profileType = orgUserProfile.getProfileType().equals(ProfileType.INVITED);
            if (profileType
                    && orgUserProfile.getInviterProfile() != null
                    && orgUserProfile.isPractice()
                    && !serviceConfigurationRepository.isPlanningUser(request.getProfileId())
                    && !serviceConfigurationRepository.isVspPlanningUser(request.getProfileId())) {
                final Patient finalPatient = patient;
                final UserProfile finalOrgUserProfile = orgUserProfile;
                final Patient finalSavedPatient = savedPatient;
                CompletableFuture.runAsync(() -> {
                    try {
                        chatService.addedPatientByPracticeMail(EmailSendReq.builder()
                                .name(finalOrgUserProfile.getUser().fullName())
                                .patientFirstName(finalPatient.fullName())
                                .date(LocalDate.now())
                                .doctorEmail(finalOrgUserProfile
                                        .getInviterProfile()
                                        .getUser()
                                        .getEmail())
                                .practiceAdminName(finalOrgUserProfile.getPracticeName())
                                .orgName(finalOrgUserProfile.getOrganizationBrandName())
                                .build());
                        chatService.notificationForPatientAddedByPractice(
                                finalOrgUserProfile
                                        .getInviterProfile()
                                        .getUser()
                                        .getEmail(),
                                finalOrgUserProfile.getPracticeName(),
                                finalSavedPatient.getId());
                        eventTriggerService.addEvent(
                                finalSavedPatient.getId(),
                                UserType.PATIENT,
                                finalOrgUserProfile
                                        .getInviterProfile()
                                        .getDoctor()
                                        .getId(),
                                UserType.DOCTOR,
                                EventType.PATIENT_ADDED_BY_PRACTICE,
                                new PatientAddedByPracticeEventMetadata(
                                        finalSavedPatient.getId(), finalOrgUserProfile.getPracticeName()),
                                finalOrgUserProfile.getInviterProfile(),
                                finalOrgUserProfile.getOrganization());
                    } catch (Exception e) {
                        log.error(
                                "Failed to process post-invitation practice notifications for patient {}",
                                finalSavedPatient.getId(),
                                e);
                    }
                });
            }
        }
        return savedPatient;
    }

    private void checkMobileAndEmailAlreadyExists(InvitePatientRequestV2 request) {
        if (request.getMobile() != null) {
            var optionalPatient = patientRepository.findByMobileNo(request.getMobile());
            if (optionalPatient.isPresent()) {
                throw new PatientAlreadyAssignedToDoctorException(
                        optionalPatient.get().getId(), request.getProfileId());
            }
        }
        if (request.getEmail() != null) {
            var patientByEmail = patientRepository.findByEmail(request.getEmail());
            if (patientByEmail.isPresent()) {
                throw new PatientAlreadyAssignedToDoctorException(
                        patientByEmail.get().getId(), request.getProfileId());
            }
        }
    }

    @Override
    public Patient registerPatientFromInvitationMobile(InvitePatientRequest request) {

        if (request.getMobile() != null) {
            var optionalPatient = patientRepository.findByMobileNo(request.getMobile());
            if (optionalPatient.isPresent()) {
                throw new PatientAlreadyAssignedToDoctorException(
                        optionalPatient.get().getId(), request.getInviterId());
            }
        }
        if (request.getEmail() != null) {
            var email = patientRepository.findByEmail(request.getEmail());
            if (email.isPresent()) {
                throw new PatientAlreadyAssignedToDoctorException(email.get().getId(), request.getInviterId());
            }
        }

        Patient patient = Patient.from(request);
        patient.setPracticeLocationId(request.getPracticeLocationId());

        return patientRepository.save(patient);
    }

    @Override
    public Patient getPatient(
            @Nullable String email, @Nullable String mobileNo, @Nullable String uuid, @Nullable Long doctorId) {
        Optional<Patient> optionalPatient = Optional.empty();

        if (uuid != null) {
            optionalPatient = findByAttribute(uuid, patientRepository::findByUUID);
        } else if (mobileNo != null) {
            optionalPatient = findByAttribute(mobileNo, patientRepository::findByMobileNo);
        } else if (email != null) {
            optionalPatient = findByAttribute(email, patientRepository::findByEmail);
        }

        if (optionalPatient.isEmpty()) throw PatientNotFoundException.with(email, mobileNo, uuid);

        return optionalPatient.get();
    }

    private Optional<Patient> findByAttribute(
            String attribute, Function<String, Optional<Patient>> repositoryFunction) {
        return repositoryFunction.apply(attribute);
    }

    @Override
    public Patient addPatientAddresses(Long patientId, List<AddressDetails> addresses) {
        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));
        var storedAddresses = patient.getAddresses();
        addresses.forEach(a -> storedAddresses.add(Address.from(a, patient)));
        patient.setAddresses(storedAddresses);

        return patientRepository.save(patient);
    }

    @Override
    public Patient updatePatientAddress(UpdatePatientAddressRequest request) {
        final Long patientId = request.getPatientId();
        final Long addressId = request.getAddressId();

        Patient patient = getPatient(patientId);
        Address address = patient.getAddresses().stream()
                .filter(a -> Objects.equals(a.getId(), addressId))
                .findFirst()
                .orElseThrow(() -> new AddressNotFoundException(patientId, addressId));

        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration()
                .setSkipNullEnabled(true)
                .setAmbiguityIgnored(true)
                .setMatchingStrategy(MatchingStrategies.STANDARD);
        mapper.map(request, address);

        return patientRepository.save(patient);
    }

    @Override
    public List<PatientResponseForCalender> getAllPatients(Long doctorId, Long profileId, Long organizationId) {
        var patientSummaries = patientRepository.findPatientSummariesByDoctorOrgAndProfile(
                doctorId, profileId, organizationId, Status.ACTIVE);
        return patientSummaries.stream().map(PatientResponseForCalender::from).collect(Collectors.toList());
    }

    public Patient updateLanguage(UpdateLanguage request) {
        var patient = patientRepository
                .findById(request.getUserId())
                .orElseThrow(() -> new PatientNotFoundException(request.getUserId()));
        patient.setLanguage(request.getLanguage());
        return patientRepository.save(patient);
    }

    @Override
    public Patient getPatientWithEmail(String email) {
        return patientRepository.findByEmail(email).orElse(null);
    }

    public String rootPath(long userId, @NotNull UserType userType) {
        return Paths.get(userType.name().toLowerCase(), String.valueOf(userId), FILES_FOLDER_NAME)
                .toString();
    }

    @Override
    public GettingStartedDetails gettingStartedDetails(Long doctorId, Long patientId) {
        var patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        String fullPath = Paths.get(rootPath(patientId, UserType.PATIENT), "/Images/Pre treatment photos")
                .toString();
        var isPreTreatmentPhotosPresent = fileRepository.existsAnyFileInPath(
                doctorId, UserType.DOCTOR, fullPath, com.dentalstack.patient.feature.storage.files.enums.Status.ACTIVE);

        var caseInfoFilled = caseInformationRepository.existsByPatientId(patientId);
        var isGettingStartedMarkedAllAsRead = patient.getIsGettingStartedMarkedAllAsRead();
        var isPatientDetailsEdited = patient.getIsPatientDetailsEdited();
        boolean askPatientToFill = false;

        var treatmentPlanSummary = treatmentPlanRepository.findLatestTreatmentPlanSummary(patientId);
        var bracesJourneySummary =
                bracesJourneyRepository.findLatestBracesJourneySummaryByPatientAndDoctor(patientId, doctorId);
        boolean treatmentEnable = false;
        AlignerTreatmentStatus treatmentStatus = null;
        PatientDataFillStatus patientDataFillStatus = null;
        ProductType productType = null;
        boolean finaliseTrackingEnable = false;
        Long alingerJourneyId = null;
        com.dentalstack.patient.feature.tracking.enums.Status status = null;
        boolean isBracesNotesAdded = false;
        if (treatmentPlanSummary.isPresent() && bracesJourneySummary.isPresent()) {
            ZonedDateTime treatmentPlanDate = treatmentPlanSummary.get().getCreatedAt();
            ZonedDateTime bracesJourneyDate = bracesJourneySummary.get().getCreatedAt();

            if (treatmentPlanDate.isBefore(bracesJourneyDate)) {
                treatmentStatus = treatmentPlanSummary.get().getStatus();
                treatmentEnable = true;
                productType = ProductType.ALIGNERS;

                var trackingSummary = trackingRepository.findLatestTrackingStatusNative(patientId);
                if (trackingSummary.isPresent()) {
                    alingerJourneyId = trackingSummary.get().getAlignerJourneyId();
                    status = trackingSummary.get().getStatus();
                    askPatientToFill = trackingSummary.get().getAskPatientToFill();
                    patientDataFillStatus =
                            convertToPatientDataFillStatus(trackingSummary.get().getPatientDataFillStatus());
                    finaliseTrackingEnable = true;
                }
            } else {
                treatmentStatus = convertBracesTreatmentStageToAlignerStatus(
                        bracesJourneySummary.get().getBracesTreatmentStage());
                treatmentEnable = true;
                productType = ProductType.BRACES;
            }
        } else if (treatmentPlanSummary.isPresent()) {
            treatmentStatus = treatmentPlanSummary.get().getStatus();
            treatmentEnable = true;
            productType = ProductType.ALIGNERS;
            var trackingSummary = trackingRepository.findLatestTrackingStatusNative(patientId);
            if (trackingSummary.isPresent()) {
                alingerJourneyId = trackingSummary.get().getAlignerJourneyId();
                status = trackingSummary.get().getStatus();
                askPatientToFill = trackingSummary.get().getAskPatientToFill();

                patientDataFillStatus =
                        convertToPatientDataFillStatus(trackingSummary.get().getPatientDataFillStatus());
                finaliseTrackingEnable = true;
            }
        } else if (bracesJourneySummary.isPresent()) {
            productType = ProductType.BRACES;
            treatmentStatus = convertBracesTreatmentStageToAlignerStatus(
                    bracesJourneySummary.get().getBracesTreatmentStage());
            treatmentEnable = true;
            isBracesNotesAdded = bracesJourneySummary.get().getHasAppointments();
        }

        return GettingStartedDetails.builder()
                .preTreatmentPhotosFilled(isPreTreatmentPhotosPresent)
                .markAllAsRead(isGettingStartedMarkedAllAsRead != null ? isGettingStartedMarkedAllAsRead : false)
                .patientDetailsEdited(isPatientDetailsEdited != null ? isPatientDetailsEdited : false)
                .caseInfoDetailsFilled(caseInfoFilled)
                .treatmentEnable(treatmentEnable)
                .treatmentStatus(treatmentStatus)
                .patientDataFillStatus(patientDataFillStatus)
                .finaliseTrackingEnable(finaliseTrackingEnable)
                .productType(productType)
                .askPatientToFill(askPatientToFill)
                .alignerJourneyId(alingerJourneyId)
                .trackingStatus(status)
                .isBracesNotesAttached(isBracesNotesAdded)
                .build();
    }

    @Override
    public void gettingStartedMakeMarkAllAsRead(GettingStartedMarkAsReadRequest request) {
        var patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));
        patient.setIsGettingStartedMarkedAllAsRead(true);
        patientRepository.save(patient);
    }

    private PatientDataFillStatus convertToPatientDataFillStatus(String statusString) {
        if (statusString == null) return null;

        return switch (statusString) {
            case "0" -> PatientDataFillStatus.ASK_PATIENT_TO_FILL;
            case "1" -> PatientDataFillStatus.PATIENT_FILLED_DATA;
            case "2" -> PatientDataFillStatus.TREATMENT_FINALIZED;
            case "3" -> PatientDataFillStatus.UNASSIGNED;
            default -> null;
        };
    }

    private AlignerTreatmentStatus convertBracesTreatmentStageToAlignerStatus(BracesTreatmentStage stage) {
        if (stage == null) return null;

        return switch (stage) {
            case ACTIVE -> AlignerTreatmentStatus.ACTIVE;
            case COMPLETE -> AlignerTreatmentStatus.COMPLETE;
            case DRAFT -> AlignerTreatmentStatus.DRAFT;
            default -> null;
        };
    }

    @Override
    public Patient updateProfilePicture(Long patientId, MultipartFile photo) {
        Patient patient = getPatient(patientId);

        try {
            String url = amazonS3Service.storeFile(
                    profilePictureBucket, getProfilePictureKey(patientId, photo.getOriginalFilename()), photo);
            patient.setProfilePictureUrl(url);

            return patientRepository.save(patient);
        } catch (Exception e) {
            throw new FailedToUploadPatientProfilePictureException(patientId);
        }
    }

    @Override
    @Transactional
    public PatientDetails updateProfilePictureAndGetDetails(Long patientId, MultipartFile photo) {
        return PatientDetails.from(updateProfilePicture(patientId, photo));
    }

    private String getProfilePictureKey(Long patientId, String fileName) {
        return String.join("/", "profile", Long.toString(patientId), "profile_picture", fileName);
    }

    @Override
    public Patient getPatient(long id) {
        return patientRepository.findById(id).orElseThrow(() -> new PatientNotFoundException(id));
    }

    @Transactional(readOnly = true)
    @Override
    public PatientDetails getPatientDetails(long id) {
        Patient patient = patientRepository.findById(id).orElseThrow(() -> new PatientNotFoundException(id));
        return PatientDetails.from(patient);
    }

    @Override
    public Optional<Patient> getPatientForTimeline(long id) {
        return patientRepository.findById(id);
    }

    @Override
    public PatientDetailsForDoctor getPatientForDoctor(Long patientId) {
        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));
        List<AlignerJourney> alignerJourneyList = alignerJourneyRepository.findByPatientId(patient.getId());
        AlignerJourney lastAddedAlignerJourney = null;
        AlignerDetailsForDoctor alignerDetailsForDoctor = new AlignerDetailsForDoctor();
        if (!alignerJourneyList.isEmpty()) {
            lastAddedAlignerJourney =
                    Collections.max(alignerJourneyList, Comparator.comparing(AlignerJourney::getCreatedAt));
            Aligner aligner = lastAddedAlignerJourney.getCurrentAligner();
            alignerDetailsForDoctor.setBrandName(lastAddedAlignerJourney.getBrand());
            alignerDetailsForDoctor.setCurrentAligner(aligner != null ? aligner.getSrNo() : 0);
            alignerDetailsForDoctor.setTreatmentFilled(aligner != null);
            alignerDetailsForDoctor.setInFutureTreatment(
                    lastAddedAlignerJourney.getProgressStatus() == ProgressStatus.NOT_STARTED);
        } else {
            alignerDetailsForDoctor.setBrandName(null);
            alignerDetailsForDoctor.setTreatmentFilled(false);
        }
        PLOfPatientResponse patientResponse = doctorService.getPracticeLocationOfPatient(patientId);
        var patientInvitationDetails = patientInvitationDetailsRepository.findByPatientId(patient.getId());

        String inviteCode = null;
        if (patientInvitationDetails.isPresent()) {
            var invitation = patientInvitationDetails.get().getInvitation();
            inviteCode = invitation.getInvitationCode().getCode();
        }
        return PatientDetailsForDoctor.from(
                patient,
                patientResponse.getPracticeLocationName(),
                patientResponse.getPracticeLocationId(),
                alignerDetailsForDoctor,
                inviteCode);
    }

    @Override
    public Patient updatePatient(UpdatePatientRequest request) {
        Long id = request.getId();
        Patient patient = patientRepository.findById(id).orElseThrow(() -> new PatientNotFoundException(id));
        String email = request.getEmail();
        if (email != null) {
            var p = patientRepository.findByEmail(email);
            if (p.isPresent() && !p.get().getId().equals(patient.getId()))
                throw new PatientAlreadyExistsException(email);
        }

        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration().setSkipNullEnabled(true).setMatchingStrategy(MatchingStrategies.STANDARD);
        mapper.map(request, patient);
        patient.setPatientStatus(PatientStatus.ACTIVE);
        patient.setGender(request.getGender());
        patient.setAge(request.getAge());
        if (request.getCountryCode() != null) {
            patient.setCountryCode(request.getCountryCode());
        }
        if (request.getMobile() != null) {
            patient.setMobileNo(request.getMobile());
        }
        return patientRepository.save(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDetails getPatientByUUID(String uuid) {
        Optional<Patient> optionalPatient = findByAttribute(uuid, patientRepository::findByUUID);
        if (optionalPatient.isPresent()) {
            return PatientDetails.from(optionalPatient.get());
        }
        Optional<PatientLead> optionalPatientLead = patientLeadRepository.findByUUID(uuid);
        if (optionalPatientLead.isPresent()) {
            return PatientDetails.from(optionalPatientLead.get());
        }

        throw new PatientNotFoundException("Patient not found with uuid: " + uuid);
    }

    @Override
    public Patient updateNewPatient(UpdateNewPatientRequest request) {
        Long id = request.getPatientId();
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(id)
                .orElseThrow(() -> new PatientNotFoundException(id));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        if (request.getEmail() != null) {
            var existingPatient = patientRepository.findByEmail(request.getEmail());
            if (existingPatient.isPresent() && !existingPatient.get().getId().equals(patient.getId())) {
                throw new PatientAlreadyExistsException(request.getEmail());
            }
            patient.setEmail(request.getEmail());
        }

        if (request.getMobile() != null) {
            var existingPatient = patientRepository.findByMobileNo(request.getMobile());
            if (existingPatient.isPresent() && !existingPatient.get().getId().equals(patient.getId())) {
                throw new PatientAlreadyExistsException(request.getMobile());
            }
            patient.setMobileNo(request.getMobile());
        }
        patient.setPatientStatus(PatientStatus.ACTIVE);
        Patient.updatePatient(patient, request);
        return patientRepository.save(patient);
    }

    @Override
    public PatientResponseMobile getPatientById(Long patientId) {
        Patient patient = patientRepository.findById(patientId).orElseThrow(() -> new UserNotFoundException(patientId));
        return PatientResponseMobile.from(patient);
    }

    @Override
    public List<PatientResponseMobile> getPatientsByDoctorId(Long doctorId, String status) {
        List<Patient> patients = patientRepository.findByDoctorId(doctorId);
        if (!patients.isEmpty()) {
            List<PatientResponseMobile> patientResponses = new ArrayList<>();
            for (Patient patient : patients) {
                if (status.equalsIgnoreCase("ALL")
                        || status.equalsIgnoreCase(patient.getPatientStatus().toString())) {
                    patientResponses.add(PatientResponseMobile.from(patient));
                }
            }
            return patientResponses;
        } else {
            throw new NoPatientAddedException(doctorId);
        }
    }

    @Transactional
    @Override
    public void delete(Long patientId) {

        var patientInvitationDetails = patientInvitationDetailsRepository.findByPatientId(patientId);
        if (patientInvitationDetails.isPresent()) {

            var invitation = patientInvitationDetails.get().getInvitation();
            alignerCacheEvict.evictAllAlignerCaches(invitation.getInviterId());

            assert invitation.getPatientInvitation() != null;
            var patient = invitation.getPatientInvitation().getPatient();
            var patientDeletedHistory = PatientDeletedHistory.from(patient, invitation.getInviterId());
            patientDeletedHistoryRepository.save(patientDeletedHistory);
            authService.deleteByUUID(patient.getUUID());
            chatService.deleteByPatientId(patientId);

            var alignerCheckIns = alignerCheckInRepository.findByPatientIdOrderByCheckInDateDesc(patientId);
            if (!alignerCheckIns.isEmpty()) {
                alignerCheckInRepository.deleteAll(alignerCheckIns);
            }

            doctorChatRepository.findByPatientId(patientId).ifPresent(doctorChat -> {
                doctorChat.getCaseTeams().clear();
                doctorChatRepository.delete(doctorChat);
            });

            var deleteAllOwnerFilesRequest = DeleteAllOwnerFilesRequest.builder()
                    .deleter(UserId.builder()
                            .userType(UserType.DOCTOR)
                            .userId(patient.getAddedByUserId())
                            .build())
                    .owner(UserId.builder()
                            .userType(UserType.PATIENT)
                            .userId(patient.getId())
                            .build())
                    .build();
            deleteAllOwnerFiles(deleteAllOwnerFilesRequest);

            patientTaskTrackerRepository.deleteAllByPatientId(patientId);

            activityRepository.deleteAllByPatientId(patientId);

            manufacturingBatchCheckListRepository.deleteAllByPatientId(patientId);

            myTaskRepository.deleteAllByPatientId(patientId);

            patientPreTreatmentRepository.deleteAllByPatientId(patientId);
            orderCommentsRepository.deleteAllByPatientId(patientId);

            patientNotesRepository.deleteAllByPatientId(patientId);

            prescriptionRepository.deleteAllByPatientId(patientId);

            patientInvitationDetailsRepository.deleteAllByPatientId(patientId);
            customerInvitationRepository.deleteAllByPatientId(patientId);

            invitationRepository.deleteAllById(Collections.singleton(invitation.getId()));

            var bracesJourneys = bracesJourneyRepository.findByPatientId(patientId);
            if (!bracesJourneys.isEmpty()) {
                for (BracesJourney bracesJourney : bracesJourneys) {
                    appointmentRepository.deleteAll(bracesJourney.getAppointments());
                }
                bracesJourneyRepository.deleteAll(bracesJourneys);
            }

            List<AlignerJourney> alignerJourneys = alignerJourneyRepository.findByPatientId(patient.getId());
            List<TreatmentPlan> treatmentPlans = treatmentPlanRepository.findByPatientId(patientId);

            for (AlignerJourney alignerJourney : alignerJourneys) {
                if (alignerJourney.getTracking() != null) {
                    trackingRepository.delete(alignerJourney.getTracking());
                }
                customAlignerReminderRepository.deleteAllByAlignerJourneyId(alignerJourney.getId());
                defaultAlignerReminderRepository.deleteAllByAlignerJourneyId(alignerJourney.getId());
            }
            trackingRepository.deleteAllByPatientId(patientId);

            for (TreatmentPlan treatmentPlan : treatmentPlans) {
                if (treatmentPlan.getTracking() != null) {
                    trackingRepository.delete(treatmentPlan.getTracking());
                }
            }
            treatmentPlanRepository.deleteAll(treatmentPlans);

            List<Order> orders = orderRepository.findByPatientId(patientId);
            if (!orders.isEmpty()) {

                for (Order order : orders) {
                    if (order.getPrescription() != null) {

                        order.setPrescription(null);
                        orderRepository.save(order);
                    }
                }
                orderRepository.deleteAll(orders);
            }

            alignerJourneyRepository.deleteAll(alignerJourneys);
            List<CaseRecordUserMapping> caseRecordUserMappings =
                    caseRecordUserMappingRepository.findAllByPatientId(patientId);

            if (!caseRecordUserMappings.isEmpty()) {
                caseRecordUserMappingRepository.deleteAll(caseRecordUserMappings);
            }
            caseRecordRepository.deleteAllByPatientId(patientId);

            patient.setDoctorOrganization(null);

            caseInformationRepository.findByPatientId(patientId).ifPresent(caseInformationRepository::delete);

            patientDoctorOrganizationRepository.deleteAllByPatientId(patientId);

            eventRepository.deleteAllByUserIdAndUserType(patient.getId(), UserType.PATIENT);
            eventRepository.deleteAllByForUserIdAndUserIdAndUserType(
                    patient.getAddedByUserId(), patient.getId(), UserType.DOCTOR);

            patientRepository.delete(patient);
            System.out.println("Deleted the patient success");

        } else {
            throw new PatientNotFoundException(patientId);
        }
    }

    @Transactional(rollbackFor = BusinessException.class)
    public void deleteAllOwnerFiles(DeleteAllOwnerFilesRequest request) {
        var owner = request.getOwner();
        var ownerUserId = owner.getUserId();
        var ownerUserType = owner.getUserType();

        List<File> filesToDelete = fileRepository.findByOwnerUserIdAndOwnerUserType(ownerUserId, ownerUserType);
        List<Long> fileIds = new ArrayList<>();
        List<String> imageUrls = new ArrayList<>();

        for (File file : filesToDelete) {
            try {

                amazonS3Service.deleteFile(filesBucket, file.getFullPath());

                List<Appointment> appointments = appointmentRepository.findByFilesContaining(file);

                for (Appointment appointment : appointments) {

                    Set<File> uniqueFiles = new HashSet<>(appointment.getFiles());
                    appointment.getFiles().clear();
                    appointment.getFiles().addAll(uniqueFiles);

                    if (appointment.getFiles().contains(file)) {

                        appointment.getFiles().remove(file);
                        appointmentRepository.save(appointment);
                    }
                }
                fileIds.add(file.getId());
                imageUrls.add(file.getUrl());

                file.delete(request.getDeleter());
                fileRepository.save(file);

            } catch (Exception e) {

                log.error(
                        "Error deleting file {} for owner {} with id {}",
                        file.getFullPath(),
                        ownerUserType,
                        ownerUserId,
                        e);
            }
        }

        var removeFilesAndImagesRequest = RemoveFilesAndImagesRequest.builder()
                .fileIds(fileIds)
                .imageUrls(imageUrls)
                .build();
        try {
            chatService.removeFilesAndImages(removeFilesAndImagesRequest);
        } catch (Exception e) {

            log.error("Error deleting files from chat service", e);
        }
    }

    @Override
    @Transactional
    public void deleteByEmail(String email) {
        authService.deleteByEmail(email);
        Patient patient = patientRepository.findByEmail(email).orElseThrow(() -> new PatientNotFoundException(email));

        if (patient.getDoctorId() != null || patient.getPatientStatus() != PatientStatus.INACTIVE) {
            patient.setDoctorId(null);
            patient.setPatientStatus(PatientStatus.INACTIVE);
            patientRepository.save(patient);
            var patientInvitationDetails = patientInvitationDetailsRepository
                    .findByPatientId(patient.getId())
                    .orElseThrow(PatientInvitationNotFoundException::new);
            var invitation = patientInvitationDetails.getInvitation();
            invitation.setStatus(InvitationStatus.SENT);
            invitation.setIsInvitationSent(false);
            invitation.setResentInviteAt(null);
            invitation.setInvitationSentAt(null);
            invitation.setSentCount(0);
            invitationRepository.save(invitation);

            var patientLead = patientLeadRepository.findByEmail(email);
            patientLead.ifPresent(patientLeadRepository::delete);

            List<Tracking> trackings = trackingRepository.findByPatientId(patient.getId());
            if (!trackings.isEmpty()) {
                Tracking latestTracking = trackings.stream()
                        .max(Comparator.comparing(Tracking::getCreatedAt))
                        .orElseThrow(() -> new IllegalStateException("Tracking list is not empty but max not found"));

                latestTracking.setIsPatientConnected(false);
                trackingRepository.save(latestTracking);
            }
        }
    }

    @Override
    public PatientOverviewDetails patientOverviewDetails(
            Long doctorId, Long patientId, String authorization, Long patientTaskTrackerId) {
        AtomicReference<Boolean> isCustomerTackingEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isCustomerStlFileEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isCustomerPrintFileEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isCustomerScanFileEnabled = new AtomicReference<>(false);
        var patient = patientRepository
                .findByIdWithDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
        var prescriptionCount = prescriptionRepository.countByPatientId(patient.getId());

        String preTreatmentPath = Paths.get(rootPath(patientId, UserType.PATIENT), "/Images/Pre treatment photos")
                .toString();
        boolean isPreTreatmentPhotosPresent = fileRepository.existsAnyFileInPath(
                doctorId,
                UserType.DOCTOR,
                preTreatmentPath,
                com.dentalstack.patient.feature.storage.files.enums.Status.ACTIVE);

        String scanFilesPath = Paths.get(rootPath(patientId, UserType.PATIENT), "/3D Files/Scan files")
                .toString();
        boolean isScanFilesPresent = fileRepository.existsAnyFileInPath(
                doctorId,
                UserType.DOCTOR,
                scanFilesPath,
                com.dentalstack.patient.feature.storage.files.enums.Status.ACTIVE);

        var caseInfoFilled = caseInformationRepository.existsByPatientId(patientId);
        var isGettingStartedMarkedAllAsRead = patient.getIsGettingStartedMarkedAllAsRead();
        var isPatientDetailsEdited = patient.getIsPatientDetailsEdited();
        OrderStatus orderStatus = null;
        String orderId = null;
        String practiceRoleId = patientDoctorOrganizationRepository.findRoleIdByPatientId(patientId);
        boolean isCustomerMappedPatient = DoctorRole.CUSTOMER.name().equals(practiceRoleId);

        var orderDetails = orderRepository.findTop1ByPatientIdOrderByCreatedAtDesc(patientId);
        var treatmentPlanSummary = treatmentPlanRepository.findLatestTreatmentPlanSummary(patientId);
        var treatmentPlanId = treatmentPlanRepository
                .findActiveTreatmentPlanIdByPatientId(patientId)
                .orElse(null);
        var reminders = reminderRepository.findByUserProfileIdAndPurposeAndAddedForUserId(
                patient.getDoctorOrganization().getUserProfile().getId(),
                ReminderPurpose.TREATMENT_START_REMINDER,
                patient.getId());

        var latestReminder = reminders.stream()
                .max(Comparator.comparing(Reminder::getId)
                        .thenComparing(Reminder::getTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElse(null);
        Optional<BracesJourney> bracesJourneySummary = bracesJourneyRepository.findLatestByPatientId(patientId);
        boolean treatmentEnable = false;
        AlignerTreatmentStatus treatmentStatus = null;
        PatientDataFillStatus patientDataFillStatus = null;
        ProductType productType = null;
        boolean finaliseTrackingEnable = false;
        Long alignerJourneyId = null;
        com.dentalstack.patient.feature.tracking.enums.Status status = null;
        boolean isBracesNotesAdded = false;
        boolean isPatientInvited;
        OrderTreatmentPlanStatus initiatorStatus = null;
        OrderTreatmentPlanStatus approverStatus = null;
        ZonedDateTime bracesTreatmentPlanCreationDate = null;
        if (treatmentPlanSummary.isPresent() && bracesJourneySummary.isPresent()) {
            ZonedDateTime treatmentPlanDate = treatmentPlanSummary.get().getCreatedAt();
            ZonedDateTime bracesJourneyDate = bracesJourneySummary.get().getCreatedAt();

            if (treatmentPlanDate.isBefore(bracesJourneyDate)) {
                treatmentStatus = treatmentPlanSummary.get().getStatus();
                treatmentEnable = true;
                productType = ProductType.ALIGNERS;
                initiatorStatus = treatmentPlanSummary.get().getInitiatorStatus();
                approverStatus = treatmentPlanSummary.get().getApproverStatus();

                var trackingSummary = trackingRepository.findLatestTrackingStatusNative(patientId);
                if (trackingSummary.isPresent()) {
                    alignerJourneyId = trackingSummary.get().getAlignerJourneyId();
                    status = trackingSummary.get().getStatus();
                    patientDataFillStatus =
                            convertToPatientDataFillStatus(trackingSummary.get().getPatientDataFillStatus());
                    finaliseTrackingEnable = true;
                }
            } else {
                treatmentStatus = convertBracesTreatmentStageToAlignerStatus(
                        bracesJourneySummary.get().getBracesTreatmentStage());
                treatmentEnable = true;
                productType = ProductType.BRACES;
                bracesTreatmentPlanCreationDate = bracesJourneySummary.get().getCreatedAt();
            }
        } else if (treatmentPlanSummary.isPresent()) {
            treatmentStatus = treatmentPlanSummary.get().getStatus();
            treatmentEnable = true;
            productType = ProductType.ALIGNERS;
            initiatorStatus = treatmentPlanSummary.get().getInitiatorStatus();
            approverStatus = treatmentPlanSummary.get().getApproverStatus();
            var trackingSummary = trackingRepository.findLatestTrackingStatusNative(patientId);
            if (trackingSummary.isPresent()) {
                alignerJourneyId = trackingSummary.get().getAlignerJourneyId();
                status = trackingSummary.get().getStatus();

                patientDataFillStatus =
                        convertToPatientDataFillStatus(trackingSummary.get().getPatientDataFillStatus());
                finaliseTrackingEnable = true;
            }
        } else if (bracesJourneySummary.isPresent()) {
            productType = ProductType.BRACES;
            treatmentStatus = convertBracesTreatmentStageToAlignerStatus(
                    bracesJourneySummary.get().getBracesTreatmentStage());
            treatmentEnable = true;
            bracesTreatmentPlanCreationDate = bracesJourneySummary.get().getCreatedAt();
        }

        if (orderDetails.isPresent()) {
            orderStatus = orderDetails.get().getStatus();
            orderId = orderDetails.get().getId();
        }

        Optional<PatientInvitationDetails> patientInvitationDetails =
                patientInvitationDetailsRepository.findByPatientId(patientId);
        Optional<Invitation> invitation = patientInvitationDetails
                .map(details ->
                        invitationRepository.findById(details.getInvitation().getId()))
                .orElseThrow(() ->
                        new PatientNotFoundException("Invitation details not found for patient id: " + patientId));

        boolean isPatientConnected = invitation.get().getStatus().equals(InvitationStatus.ACCEPTED);
        Long invitationId = invitation.get().getId();
        Duration inviteSentDuration = null;
        ZonedDateTime resentAt = null;

        if (Boolean.TRUE.equals(invitation.get().getIsInvitationSent())) {
            resentAt = invitation.get().getResentInviteAt();
            if (resentAt != null) {
                ZonedDateTime sentAt = invitation.get().getInvitationSentAt();

                inviteSentDuration = Duration.between(resentAt, ZonedDateTime.now());

                if (sentAt == null) {
                    invitation.get().setInvitationSentAt(resentAt);
                    invitationRepository.save(invitation.get());
                }
            }
        }

        String createdAt =
                treatmentPlanSummary.isPresent() && treatmentPlanSummary.get().getCreatedAt() != null
                        ? treatmentPlanSummary.get().getCreatedAt().toString()
                        : null;
        Boolean isApprovedByPatient =
                treatmentPlanSummary.isPresent() && treatmentPlanSummary.get().getIsApprovedByPatient() != null
                        ? treatmentPlanSummary.get().getIsApprovedByPatient()
                        : null;
        String approvedByPatientAt =
                treatmentPlanSummary.isPresent() && treatmentPlanSummary.get().getApprovedByPatientAt() != null
                        ? treatmentPlanSummary.get().getApprovedByPatientAt().toString()
                        : null;

        boolean isTreatmentFinalized = treatmentPlanSummary.isPresent()
                && treatmentPlanSummary.get().getStatus().equals(AlignerTreatmentStatus.ACTIVE);
        isPatientInvited = invitation.get().getIsInvitationSent() != null
                ? invitation.get().getIsInvitationSent()
                : false;

        PatientTaskTracker patientTaskTracker = null;
        if (patientTaskTrackerId != null) {
            patientTaskTracker = patientTaskTrackerRepository.findByIdWithAssignee(patientTaskTrackerId);
        }

        Long organizationId = patient.getDoctorOrganization().getOrganization().getId();
        Long customerProfileId =
                patient.getDoctorOrganization().getUserProfile().getId();

        if (organizationId != null && customerProfileId != null) {
            Optional<CustomerAccessAndRevoke> car = customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                    customerProfileId, organizationId);
            car.ifPresent(c -> {
                isCustomerTackingEnabled.set(c.getIsTrackingEnabled());
                isCustomerStlFileEnabled.set(c.getIsStlFileViewEnabled());
                isCustomerPrintFileEnabled.set(c.getIsPrintFileViewEnabled());
                isCustomerScanFileEnabled.set(c.getIsScanFileViewEnabled());
            });
        }
        var labProfileId =
                patient.getDoctorOrganization().getAddedByUserProfile().getId();
        var enabledItemNames = serviceConfigurationRepository.findEnabledItemNames(labProfileId);
        var isOrderCloned = orderRepository.hasClonedOrder(patientId);

        return PatientOverviewDetails.from(
                caseInfoFilled,
                isPreTreatmentPhotosPresent,
                isPatientDetailsEdited,
                isGettingStartedMarkedAllAsRead,
                treatmentEnable,
                finaliseTrackingEnable,
                patientDataFillStatus,
                false,
                treatmentStatus,
                productType,
                alignerJourneyId,
                status,
                isBracesNotesAdded,
                createdAt,
                isScanFilesPresent,
                isApprovedByPatient,
                approvedByPatientAt,
                patient,
                invitationId,
                isPatientConnected,
                isPatientInvited,
                bracesTreatmentPlanCreationDate,
                isTreatmentFinalized,
                orderId,
                orderStatus,
                initiatorStatus,
                approverStatus,
                isCustomerMappedPatient,
                prescriptionCount,
                treatmentPlanId,
                latestReminder,
                patientTaskTracker,
                inviteSentDuration,
                resentAt,
                isCustomerTackingEnabled,
                isCustomerStlFileEnabled,
                isCustomerPrintFileEnabled,
                isCustomerScanFileEnabled,
                enabledItemNames,
                isOrderCloned);
    }

    @Override
    public PatientOverviewDetails patientOverviewDetails(PatientOverviewDetailsRequest request) {
        AtomicReference<Boolean> isCustomerTackingEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isCustomerStlFileEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isCustomerPrintFileEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isCustomerScanFileEnabled = new AtomicReference<>(false);
        var patient = patientRepository
                .findByIdWithDetails(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));
        var prescriptionCount = prescriptionRepository.countByPatientId(patient.getId());
        String preTreatmentPath = Paths.get(
                        rootPath(request.getPatientId(), UserType.PATIENT), "/Images/Pre treatment photos")
                .toString();
        boolean isPreTreatmentPhotosPresent = fileRepository.existsAnyFileInPath(
                request.getDoctorId(),
                UserType.DOCTOR,
                preTreatmentPath,
                com.dentalstack.patient.feature.storage.files.enums.Status.ACTIVE);

        String scanFilesPath = Paths.get(rootPath(request.getPatientId(), UserType.PATIENT), "/3D Files/Scan files")
                .toString();
        boolean isScanFilesPresent = fileRepository.existsAnyFileInPath(
                request.getDoctorId(),
                UserType.DOCTOR,
                scanFilesPath,
                com.dentalstack.patient.feature.storage.files.enums.Status.ACTIVE);

        var caseInfoFilled = caseInformationRepository.existsByPatientId(request.getPatientId());
        var isGettingStartedMarkedAllAsRead = patient.getIsGettingStartedMarkedAllAsRead();
        var isPatientDetailsEdited = patient.getIsPatientDetailsEdited();
        OrderStatus orderStatus = null;
        String orderId = null;
        String practiceRoleId = patientDoctorOrganizationRepository.findRoleIdByPatientId(request.getPatientId());
        boolean isCustomerMappedPatient = DoctorRole.CUSTOMER.name().equals(practiceRoleId);

        var orderDetails = orderRepository.findTop1ByPatientIdOrderByCreatedAtDesc(request.getPatientId());
        var treatmentPlanSummary = treatmentPlanRepository.findLatestTreatmentPlanSummary(request.getPatientId());
        var treatmentPlanId = treatmentPlanRepository
                .findActiveTreatmentPlanIdByPatientId(request.getPatientId())
                .orElse(null);
        var reminders = reminderRepository.findByUserProfileIdAndPurposeAndAddedForUserId(
                patient.getDoctorOrganization().getUserProfile().getId(),
                ReminderPurpose.TREATMENT_START_REMINDER,
                patient.getId());

        var latestReminder = reminders.stream()
                .max(Comparator.comparing(Reminder::getId)
                        .thenComparing(Reminder::getTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElse(null);
        Optional<BracesJourney> bracesJourneySummary =
                bracesJourneyRepository.findLatestByPatientId(request.getPatientId());
        boolean treatmentEnable = false;
        AlignerTreatmentStatus treatmentStatus = null;
        PatientDataFillStatus patientDataFillStatus = null;
        ProductType productType = null;
        boolean finaliseTrackingEnable = false;
        Long alignerJourneyId = null;
        com.dentalstack.patient.feature.tracking.enums.Status status = null;
        boolean isBracesNotesAdded = false;
        boolean isPatientInvited;
        OrderTreatmentPlanStatus initiatorStatus = null;
        OrderTreatmentPlanStatus approverStatus = null;
        ZonedDateTime bracesTreatmentPlanCreationDate = null;
        if (treatmentPlanSummary.isPresent() && bracesJourneySummary.isPresent()) {
            ZonedDateTime treatmentPlanDate = treatmentPlanSummary.get().getCreatedAt();
            ZonedDateTime bracesJourneyDate = bracesJourneySummary.get().getCreatedAt();

            if (treatmentPlanDate.isBefore(bracesJourneyDate)) {
                treatmentStatus = treatmentPlanSummary.get().getStatus();
                treatmentEnable = true;
                productType = ProductType.ALIGNERS;
                initiatorStatus = treatmentPlanSummary.get().getInitiatorStatus();
                approverStatus = treatmentPlanSummary.get().getApproverStatus();

                var trackingSummary = trackingRepository.findLatestTrackingStatusNative(request.getPatientId());
                if (trackingSummary.isPresent()) {
                    alignerJourneyId = trackingSummary.get().getAlignerJourneyId();
                    status = trackingSummary.get().getStatus();
                    patientDataFillStatus =
                            convertToPatientDataFillStatus(trackingSummary.get().getPatientDataFillStatus());
                    finaliseTrackingEnable = true;
                }
            } else {
                treatmentStatus = convertBracesTreatmentStageToAlignerStatus(
                        bracesJourneySummary.get().getBracesTreatmentStage());
                treatmentEnable = true;
                productType = ProductType.BRACES;
                bracesTreatmentPlanCreationDate = bracesJourneySummary.get().getCreatedAt();
            }
        } else if (treatmentPlanSummary.isPresent()) {
            treatmentStatus = treatmentPlanSummary.get().getStatus();
            treatmentEnable = true;
            productType = ProductType.ALIGNERS;
            initiatorStatus = treatmentPlanSummary.get().getInitiatorStatus();
            approverStatus = treatmentPlanSummary.get().getApproverStatus();
            var trackingSummary = trackingRepository.findLatestTrackingStatusNative(request.getPatientId());
            if (trackingSummary.isPresent()) {
                alignerJourneyId = trackingSummary.get().getAlignerJourneyId();
                status = trackingSummary.get().getStatus();

                patientDataFillStatus =
                        convertToPatientDataFillStatus(trackingSummary.get().getPatientDataFillStatus());
                finaliseTrackingEnable = true;
            }
        } else if (bracesJourneySummary.isPresent()) {
            productType = ProductType.BRACES;
            treatmentStatus = convertBracesTreatmentStageToAlignerStatus(
                    bracesJourneySummary.get().getBracesTreatmentStage());
            treatmentEnable = true;
            bracesTreatmentPlanCreationDate = bracesJourneySummary.get().getCreatedAt();
        }

        if (orderDetails.isPresent()) {
            orderStatus = orderDetails.get().getStatus();
            orderId = orderDetails.get().getId();
        }

        Optional<PatientInvitationDetails> patientInvitationDetails =
                patientInvitationDetailsRepository.findByPatientId(request.getPatientId());
        Optional<Invitation> invitation = patientInvitationDetails
                .map(details ->
                        invitationRepository.findById(details.getInvitation().getId()))
                .orElseThrow(() -> new PatientNotFoundException(
                        "Invitation details not found for patient id: " + request.getPatientId()));

        boolean isPatientConnected = invitation.get().getStatus().equals(InvitationStatus.ACCEPTED);
        Long invitationId = invitation.get().getId();
        Duration inviteSentDuration = null;
        ZonedDateTime resentAt = null;

        if (Boolean.TRUE.equals(invitation.get().getIsInvitationSent())) {
            resentAt = invitation.get().getResentInviteAt();
            if (resentAt != null) {
                ZonedDateTime sentAt = invitation.get().getInvitationSentAt();

                inviteSentDuration = Duration.between(resentAt, ZonedDateTime.now());

                if (sentAt == null) {
                    invitation.get().setInvitationSentAt(resentAt);
                    invitationRepository.save(invitation.get());
                }
            }
        }

        String createdAt =
                treatmentPlanSummary.isPresent() && treatmentPlanSummary.get().getCreatedAt() != null
                        ? treatmentPlanSummary.get().getCreatedAt().toString()
                        : null;
        Boolean isApprovedByPatient =
                treatmentPlanSummary.isPresent() && treatmentPlanSummary.get().getIsApprovedByPatient() != null
                        ? treatmentPlanSummary.get().getIsApprovedByPatient()
                        : null;
        String approvedByPatientAt =
                treatmentPlanSummary.isPresent() && treatmentPlanSummary.get().getApprovedByPatientAt() != null
                        ? treatmentPlanSummary.get().getApprovedByPatientAt().toString()
                        : null;

        boolean isTreatmentFinalized = treatmentPlanSummary.isPresent()
                && treatmentPlanSummary.get().getStatus().equals(AlignerTreatmentStatus.ACTIVE);
        isPatientInvited = invitation.get().getIsInvitationSent() != null
                ? invitation.get().getIsInvitationSent()
                : false;

        PatientTaskTracker patientTaskTracker = null;
        if (request.getPatientTaskTrackerId() != null) {
            patientTaskTracker = patientTaskTrackerRepository.findByIdWithAssignee(request.getPatientTaskTrackerId());
        }

        Long organizationId = patient.getDoctorOrganization().getOrganization().getId();
        Long customerProfileId =
                patient.getDoctorOrganization().getUserProfile().getId();

        if (organizationId != null && customerProfileId != null) {
            Optional<CustomerAccessAndRevoke> car = customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                    customerProfileId, organizationId);
            car.ifPresent(c -> {
                isCustomerTackingEnabled.set(c.getIsTrackingEnabled());
                isCustomerStlFileEnabled.set(c.getIsStlFileViewEnabled());
                isCustomerPrintFileEnabled.set(c.getIsPrintFileViewEnabled());
                isCustomerScanFileEnabled.set(c.getIsScanFileViewEnabled());
            });
        }
        var labProfileId =
                patient.getDoctorOrganization().getAddedByUserProfile().getId();
        var enabledItemNames = serviceConfigurationRepository.findEnabledItemNames(labProfileId);
        var isOrderCloned = orderRepository.hasClonedOrder(patient.getId());

        return PatientOverviewDetails.from(
                caseInfoFilled,
                isPreTreatmentPhotosPresent,
                isPatientDetailsEdited,
                isGettingStartedMarkedAllAsRead,
                treatmentEnable,
                finaliseTrackingEnable,
                patientDataFillStatus,
                false,
                treatmentStatus,
                productType,
                alignerJourneyId,
                status,
                isBracesNotesAdded,
                createdAt,
                isScanFilesPresent,
                isApprovedByPatient,
                approvedByPatientAt,
                patient,
                invitationId,
                isPatientConnected,
                isPatientInvited,
                bracesTreatmentPlanCreationDate,
                isTreatmentFinalized,
                orderId,
                orderStatus,
                initiatorStatus,
                approverStatus,
                isCustomerMappedPatient,
                prescriptionCount,
                treatmentPlanId,
                latestReminder,
                patientTaskTracker,
                inviteSentDuration,
                resentAt,
                isCustomerTackingEnabled,
                isCustomerStlFileEnabled,
                isCustomerPrintFileEnabled,
                isCustomerScanFileEnabled,
                enabledItemNames,
                isOrderCloned);
    }

    @Override
    public PatientConnectionDetails patientConnectionDetails(String email, Long patientId, String orgName) {
        final Patient patient = (patientId == null)
                ? patientRepository.findByEmail(email).orElseThrow(() -> PatientNotFoundException.withEmail(email))
                : patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        final Long patientIds = patient.getId();
        Optional<PatientInvitationDetails> patientInvitationDetails =
                patientInvitationDetailsRepository.findByPatientId(patientIds);

        Optional<Invitation> invitation = patientInvitationDetails
                .map(details ->
                        invitationRepository.findById(details.getInvitation().getId()))
                .orElseThrow(() ->
                        new PatientNotFoundException("Invitation details not found for patient id: " + patientIds));

        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(patient.getId())
                .orElseThrow(() -> new PatientNotFoundException(patient.getId()));

        UserProfile doctor = patientDoctorOrganization.getUserProfile();
        String doctorOrg = doctor.getOrganizationBrandName();

        if (!doctorOrg.equalsIgnoreCase(orgName)) {
            throw new OrgNameMismatchException(doctorOrg);
        }

        boolean isPatientConnected = invitation.get().getStatus().equals(InvitationStatus.ACCEPTED);
        PracticeLocation practiceLocation = null;

        if (patient.getPracticeLocationId() != null) {
            practiceLocation = practiceLocationRepository
                    .findById(patient.getPracticeLocationId())
                    .orElseThrow(() -> new PracticeLocationNotFoundException(patient.getPracticeLocationId()));
        }
        return PatientConnectionDetails.from(
                patient,
                patientDoctorOrganization,
                isPatientConnected,
                practiceLocation != null ? practiceLocation.getAddress() : null,
                invitation.get().getInviterId());
    }

    @Override
    public void toggleStlFileView(ToggleStlFileViewRequest request) {
        Optional<Patient> patient = patientRepository.findById(request.getPatientId());
        patient.ifPresent(p -> {
            p.setIsStlFileViewEnabled(!Boolean.TRUE.equals(p.getIsStlFileViewEnabled()));
            patientRepository.save(p);
        });
    }

    @Override
    public void toggleIsTrackingForCustomer(ToggleTrackingRequest request) {
        Optional<Patient> patient = patientRepository.findById(request.getPatientId());
        patient.ifPresent(p -> {
            p.setIsTrackingEnabled(!Boolean.TRUE.equals(p.getIsTrackingEnabled()));
            patientRepository.save(p);
        });
    }

    @Override
    public PatientDetailsV3 getPatientDetailsV3(PatientGetRequest request) {
        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var requestUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (adminWithDefaultTag && requestUserProfile.getInviterProfile() != null) {
            var inviterProfile = requestUserProfile.getInviterProfile();
            request.setProfileId(inviterProfile.getId());
            request.setDoctorId(inviterProfile.getId());
            request.setOrganizationId(inviterProfile.getId());
        }
        var patient = patientDoctorOrganizationRepository
                .getPatientByProfileId(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getProfileId()));

        Optional<Order> activeOrderIdOptional;
        Optional<Order> latestOrderIdOptional = orderRepository.findLatestOrderByPatient(request.getPatientId());
        ;
        if (requestUserProfile.isEnterprise()) {
            activeOrderIdOptional =
                    orderRepository.findLatestActiveOrderIdByPatientExcludingDraft(request.getPatientId());

        } else {

            activeOrderIdOptional =
                    orderRepository.findLatestActiveOrderIdByPatientIncludingDraft(request.getPatientId());
        }

        Optional<Long> invitationId =
                patientInvitationDetailsRepository.findInvitationIdByPatientId(request.getDoctorId());
        var archivedOrderIds = orderRepository.findArchivedOrderIdsByPatient(request.getPatientId());

        Optional<Invitation> invitationOptional = invitationId
                .map(details -> invitationRepository.findById(invitationId.get()))
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

        Invitation invitation = invitationOptional.orElse(null);

        var chatIds = doctorChatRepository.findChatIdsByPatientId(request.getPatientId());
        if (activeOrderIdOptional.isPresent()) {
            return PatientDetailsV3.newPatientList(
                    patient,
                    invitation,
                    activeOrderIdOptional.get(),
                    latestOrderIdOptional.get(),
                    archivedOrderIds,
                    chatIds);
        }
        return PatientDetailsV3.newPatientList(patient, invitation, null, null, archivedOrderIds, chatIds);
    }

    @Override
    public PlanningStepperResponse getPatientCurrentStep(PatientGetRequest request) {
        OrderCountSummary summary = orderRepository.getOrderCountSummaryByPatientAndProfile(request.getPatientId());

        OrderComments latestOrderComment = orderCommentsRepository
                .findTopByTaskIdIsNotNullAndPatientIdOrderByCreatedAtDesc(request.getPatientId())
                .orElse(null);

        if (summary == null || summary.getTotalCount() == 0) {
            return buildEmptyOrdersResponse(latestOrderComment);
        }
        return resolveStepperResponse(summary, latestOrderComment);
    }

    @Override
    @Cacheable(value = "defaultPatientFolderStatus", key = "#patientId", unless = "#result == null || #result == false")
    public Boolean getDefaultPatientFolderStatus(Long patientId) {
        PatientDoctorOrganization patientDoctorOrganization =
                patientDoctorOrganizationRepository.findByPatient(patientId);
        if (patientDoctorOrganization == null || patientDoctorOrganization.getUserProfile() == null) {
            return false;
        }

        Long profileId;
        if (patientDoctorOrganization.getUserProfile().isOwner()) {
            profileId = patientDoctorOrganization.getUserProfile().getId();
        } else {
            var inviterProfile = patientDoctorOrganization.getUserProfile().getInviterProfile();
            if (inviterProfile == null) {
                return false;
            }
            profileId = inviterProfile.getId();
        }

        List<String> requiredFolderSuffixes = List.of(
                "3D Files/Print files",
                "Images/Pre treatment photos",
                "3D Files/Scan files",
                "Chat",
                "Documents",
                "3D Files",
                "Images",
                "Orders");

        return requiredFolderSuffixes.stream()
                .allMatch(folderSuffix -> fileRepository.existsDefaultPatientFolderByProfileAndPatientAndSuffix(
                        profileId, patientId, folderSuffix));
    }

    private PlanningStepperResponse resolveStepperResponse(
            OrderCountSummary summary, OrderComments latestOrderComment) {
        long total = summary.getTotalCount();
        long draft = summary.getDraftCount();
        long rePlan = summary.getRePlanCount();
        long ordered = summary.getOrderedCount();
        long inReview = summary.getInReviewCount();
        long approved = summary.getApprovedCount();
        long stlRequested = summary.getStlFilesRequestedCount();
        long stlUploaded = summary.getStlFilesUploadedCount();
        long completed = summary.getCompletedCount();
        long archived = summary.getArchivedCount();
        long pendingReviewTreatmentCount = summary.getInReviewTreatmentCount();

        long activeOrders = total - draft - archived;
        String orderId = summary.getLatestOrderId();

        if (total == 0 || activeOrders == 0) {
            boolean hasDraft = draft > 0;
            return buildResponse(
                    hasDraft ? NextAction.SEND_ORDER : NextAction.CREATE_ORDER,
                    summary.getLatestOrderStatus(),
                    pendingReviewTreatmentCount,
                    latestOrderComment,
                    orderId);
        }

        if (completed > 0) {
            return buildResponse(
                    NextAction.COMPLETE_ORDER,
                    summary.getLatestOrderStatus(),
                    pendingReviewTreatmentCount,
                    latestOrderComment,
                    orderId);
        }

        if (stlUploaded > 0) {
            return buildResponse(
                    NextAction.COMPLETE_ORDER,
                    summary.getLatestOrderStatus(),
                    pendingReviewTreatmentCount,
                    latestOrderComment,
                    orderId);
        }

        if (stlRequested > 0) {
            return buildResponse(
                    NextAction.WAITING_FOR_STL_FILES,
                    summary.getLatestOrderStatus(),
                    pendingReviewTreatmentCount,
                    latestOrderComment,
                    orderId);
        }

        if (approved > 0) {
            return buildResponse(
                    NextAction.REQUEST_STL_FILES,
                    summary.getLatestOrderStatus(),
                    pendingReviewTreatmentCount,
                    latestOrderComment,
                    orderId);
        }

        if (inReview > 0) {
            return buildResponse(
                    NextAction.APPROVE_PLAN,
                    summary.getLatestOrderStatus(),
                    pendingReviewTreatmentCount,
                    latestOrderComment,
                    orderId);
        }

        if (ordered > 0) {
            return buildResponse(
                    NextAction.WAITING_FOR_TREATMENT_PLAN,
                    summary.getLatestOrderStatus(),
                    pendingReviewTreatmentCount,
                    latestOrderComment,
                    orderId);
        }

        if (rePlan > 0) {
            return buildResponse(
                    NextAction.RE_PLAN,
                    summary.getLatestOrderStatus(),
                    pendingReviewTreatmentCount,
                    latestOrderComment,
                    orderId);
        }

        return buildResponse(
                NextAction.CREATE_ORDER,
                summary.getLatestOrderStatus(),
                pendingReviewTreatmentCount,
                latestOrderComment,
                orderId);
    }

    private PlanningStepperResponse buildEmptyOrdersResponse(OrderComments latestOrderComment) {
        return buildResponse(NextAction.CREATE_ORDER, null, null, latestOrderComment, null);
    }

    private PlanningStepperResponse buildResponse(
            NextAction nextAction,
            String status,
            Long pendingReviewTreatmentCount,
            OrderComments latestOrderComment,
            String orderId) {

        String mappedStatus = mapOrderStatusForResponse(status);

        PlanningStepperResponse response = new PlanningStepperResponse();
        response.setNextAction(nextAction != null ? nextAction.getMessage() : null);
        response.setOrderStatus(mappedStatus);
        response.setActualOrderStatus(status);
        response.setPendingReviewTreatmentCount(pendingReviewTreatmentCount);
        response.setOrderId(orderId);

        if (latestOrderComment != null) {
            response.setNotes(latestOrderComment.getNotes());
            response.setRemark(latestOrderComment.getRemark());
            response.setCommentAddedAt(latestOrderComment.getCreatedAt());
        } else {
            response.setNotes(null);
            response.setRemark(null);
            response.setCommentAddedAt(null);
        }

        return response;
    }

    private String mapOrderStatusForResponse(String status) {
        if (status == null) return null;

        return switch (status) {
            case "STL_FILES_REQUESTED", "STL_FILES_UPLOADED" -> "APPROVED";
            case "ORDERED" -> "IN_PROGRESS";
            default -> status;
        };
    }
}
