package com.dentalstack.patient.feature.aligner.service.impl;

import com.amazonaws.services.kms.model.NotFoundException;
import com.dentalstack.patient.feature.aligner.dto.aligner.ChangeAlignerRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.AlignerPhotoProjection;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.AlignerPhotosByAlignerResponse;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.CheckInAlignerRequest;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerFeedback;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.AlignerPhoto;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.aligner.enums.aligner.action.AlignerUpdateCategory;
import com.dentalstack.patient.feature.aligner.exception.aligner.AlignerJourneyNotFoundException;
import com.dentalstack.patient.feature.aligner.repository.AlignerFeedbackRepository;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.repository.AlignerPhotoRepository;
import com.dentalstack.patient.feature.aligner.repository.action.AlignerActionRepository;
import com.dentalstack.patient.feature.aligner.service.AlignerActionV2Service;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.entity.CustomerAccessAndRevoke;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.repository.CustomerAccessAndRevokeRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.notification.dto.AddChatRequest;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.storage.drive.GDrivePlatformProvider;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.storage.files.domain.FileUploadDetails;
import com.dentalstack.patient.feature.storage.files.domain.GDriveStatus;
import com.dentalstack.patient.feature.storage.files.dto.UploadFilesRequest;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.enums.HasShared;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.subcription.exception.StorageLimitExceededException;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.timeline.dto.ChatEventObject;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.AlignerCheckInEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.AlignerCheckInForDoctorEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.PatientAddedPhotoEventMetadata;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
public class AlignerActionV2ServiceImpl implements AlignerActionV2Service {

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final AlignerFeedbackRepository alignerFeedbackRepository;
    private final AlignerActionRepository alignerActionRepository;
    private final TimelineService timelineService;
    private final NotificationService notificationService;
    private final DoctorService doctorService;
    private final SubscriptionService subscriptionService;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final PatientRepository patientRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final FilesService filesService;
    private final FileRepository fileRepository;
    private final AlignerPhotoRepository alignerPhotoRepository;
    private final GDrivePlatformProvider gDrivePlatformProvider;
    private final GoogleDriveService googleDriveService;
    private final CustomerAccessAndRevokeRepository customerAccessAndRevokeRepository;
    private final ChatService chatService;

    @Override
    @Transactional
    public void checkIn(CheckInAlignerRequest request, MultipartFile[] photos) {
        var userId = request.getUserId();
        var userType = request.getUserType();
        if (!userType.equals(UserType.PATIENT)) {
            throw new BadRequestException("Only patient can check in the aligner");
        }

        final long alignerJourneyId = request.getAlignerJourneyId();
        final int alignerNo = request.getAlignerNo();

        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        Long organizationId = patient.getDoctorOrganization().getOrganization().getId();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        alignerJourney.validate();
        var aligner = alignerJourney.getAligner(alignerNo);

        List<AlignerPhoto> alignerCheckInPhotos = new ArrayList<>();
        String parentPath = null;

        if (photos != null && photos.length > 0) {
            PatientDoctorOrganization patientDoctorOrganization = patientDoctorOrganizationRepository.findByPatient(
                    alignerJourney.getPatient().getId());

            if (patientDoctorOrganization == null) {
                throw new NotFoundException("No organization found for the given patient and doctor.");
            }

            var subscriptionResponse = subscriptionService.getSubSubscriptionDetails(
                    alignerJourney.getDoctorId(),
                    patientDoctorOrganization.getUserProfile().getId());

            if (subscriptionResponse != null) {
                double totalStorageGb = subscriptionResponse.getTotalStorageGb();
                double usedStorageMb = subscriptionResponse.getUsedStorageGb();
                long usedStorageBytes = (long) (usedStorageMb * 1_048_576L);

                long totalFilesSizeBytes = 0;
                for (MultipartFile file : photos) {
                    totalFilesSizeBytes += file.getSize();
                }

                long totalStorageBytes = (long) (totalStorageGb * 1_073_741_824L);
                if (usedStorageBytes + totalFilesSizeBytes > totalStorageBytes) {
                    throw new StorageLimitExceededException(alignerJourney.getDoctorId());
                }
            }

            parentPath = String.format(
                    "Aligners/%s/Aligner %d/",
                    alignerJourney.getTracking().getTreatmentPlan().getTreatmentPlanName(), alignerNo);

            FileUploadDetails uploadDetails = uploadAllPhotos(alignerJourney, alignerNo, photos);

            alignerCheckInPhotos = createAlignerPhotosFromUpload(
                    uploadDetails,
                    aligner,
                    userId,
                    request.getWithAlignerPhotoFiles(),
                    request.getWithoutAlignerPhotoFiles());

            shareAlignerFolderIfNeeded(patientDoctorOrganization, parentPath, patient);
        }

        AlignerFeedback feedback = null;
        if (request.getFeedback() != null) {
            feedback = AlignerFeedback.ofTypeAlignerCheckIn(request, aligner);
            feedback = alignerFeedbackRepository.save(feedback);
            aligner.getFeedbacks().add(feedback);
        }

        if (!alignerCheckInPhotos.isEmpty()) {
            timelineService.addEvent(
                    alignerJourney.getPatient().getId(),
                    UserType.PATIENT,
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.PHOTO_ADDED_BY_PATIENT,
                    new PatientAddedPhotoEventMetadata(
                            alignerJourney.getPatient().getId(), parentPath));
        }

        var alignerCheckInAction =
                AlignerAction.alignerCheckInByPatient(userId, aligner, alignerCheckInPhotos, feedback);
        aligner.getActions().add(alignerCheckInAction);
        var doctor = doctorService.getDoctor(patient.getAddedByUserId());
        alignerActionRepository.save(alignerCheckInAction);

        alignerJourneyRepository.save(alignerJourney);

        if (alignerCheckInAction.getUpdateCategory().equals(AlignerUpdateCategory.CRITICAL)) {
            Optional<CustomerAccessAndRevoke> customerAccessAndRevoke =
                    customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                            userProfile.getId(), organizationId);
            customerAccessAndRevoke.ifPresent(c -> {
                if (c.getIsTrackingEnabled()) {
                    notificationService.notificationForCriticalCheckIn(
                            doctor,
                            patient,
                            alignerJourney.getId(),
                            alignerCheckInAction.getId(),
                            userProfile.getId(),
                            userProfile.getDoctor().getId());
                }
            });
        } else {
            Optional<CustomerAccessAndRevoke> customerAccessAndRevoke =
                    customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                            userProfile.getId(), organizationId);
            customerAccessAndRevoke.ifPresent(c -> {
                if (c.getIsTrackingEnabled()) {
                    notificationService.notificationForNormalCheckIn(
                            doctor,
                            patient,
                            alignerJourney.getId(),
                            alignerCheckInAction.getId(),
                            userProfile.getId(),
                            userProfile.getUser().getMobileNo(),
                            userProfile.getDoctor().getId());
                }
            });
        }

        timelineService.addEvent(
                userId,
                UserType.PATIENT,
                alignerJourney.getDoctorId(),
                UserType.DOCTOR,
                EventType.ALIGNER_CHECK_IN_FOR_DOCTOR,
                AlignerCheckInForDoctorEventMetadata.checkIn(
                        aligner,
                        alignerCheckInPhotos,
                        alignerJourney.getPatient().getId(),
                        request.getFeedback(),
                        alignerCheckInAction));

        AlignerCheckInEventMetadata metadata = AlignerCheckInEventMetadata.checkIn(
                aligner,
                alignerCheckInPhotos,
                alignerJourney.getPatient().getId(),
                request.getFeedback(),
                alignerCheckInAction);

        timelineService.addEvent(
                doctor.getDoctorId(), UserType.DOCTOR, userId, UserType.PATIENT, EventType.ALIGNER_CHECK_IN, metadata);

        ChatEventObject chatEventObject = ChatEventObject.builder()
                .eventType(EventType.ALIGNER_CHECK_IN)
                .eventMetadata(metadata)
                .build();

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.valueToTree(chatEventObject);

        var addChatRequest = AddChatRequest.builder()
                .createdBy(patient.fullName())
                .doctorName(userProfile.getUser().displayName())
                .doctorId(doctor.getDoctorId())
                .patientId(patient.getId())
                .patientName(patient.fullName())
                .roleName(UserType.PATIENT.name())
                .additionalData(jsonNode)
                .build();

        try {
            chatService.addChatEvent(addChatRequest);
        } catch (Exception e) {
            log.info("Something went wrong during check-in chat event: " + e.getLocalizedMessage());
        }
    }

    private FileUploadDetails uploadAllPhotos(AlignerJourney alignerJourney, int alignerNo, MultipartFile[] photos) {

        UploadFilesRequest uploadRequest = new UploadFilesRequest();

        String parentPath = String.format(
                "Aligners/%s/Aligner %d/",
                alignerJourney.getTracking().getTreatmentPlan().getTreatmentPlanName(), alignerNo);

        uploadRequest.setParentPath(parentPath);

        UserId uploader = new UserId();
        uploader.setUserId(alignerJourney.getPatient().getId());
        uploader.setUserType(UserType.PATIENT);
        uploadRequest.setUploader(uploader);

        Set<UserId> owners = new HashSet<>();

        UserId patientOwner = new UserId();
        patientOwner.setUserId(alignerJourney.getPatient().getId());
        patientOwner.setUserType(UserType.PATIENT);
        owners.add(patientOwner);

        UserId doctorOwner = new UserId();
        doctorOwner.setUserId(alignerJourney.getDoctorId());
        doctorOwner.setUserType(UserType.DOCTOR);
        owners.add(doctorOwner);

        uploadRequest.setOwners(owners);

        return filesService.uploadFiles(uploadRequest, photos, false);
    }

    @Transactional(readOnly = true)
    public List<AlignerPhotosByAlignerResponse> getPhotosByPatientIdGroupedByAligner(Long patientId) {
        List<AlignerPhotoProjection> projections = alignerPhotoRepository.findPhotosByPatientId(patientId);

        Map<Integer, List<AlignerPhotoProjection>> groupedByAligner =
                projections.stream().collect(Collectors.groupingBy(AlignerPhotoProjection::getAlignerSrNo));

        return groupedByAligner.entrySet().stream()
                .map(entry -> {
                    int srNo = entry.getKey();
                    List<AlignerPhotoProjection> photos = entry.getValue();

                    JawType jawType = photos.isEmpty() ? null : photos.get(0).getJawType();

                    List<AlignerPhotosByAlignerResponse.PhotoDetail> photoDetails = photos.stream()
                            .map(p -> AlignerPhotosByAlignerResponse.PhotoDetail.builder()
                                    .photoId(p.getId())
                                    .imageName(p.getImageName())
                                    .withAligner(p.isWithAligner())
                                    .imageUrl(p.getImageUrl())
                                    .description(p.getDescription())
                                    .uploaderUserType(p.getUploaderUserType())
                                    .uploadedBy(p.getUploadedBy())
                                    .build())
                            .collect(Collectors.toList());

                    return AlignerPhotosByAlignerResponse.builder()
                            .alignerSrNo(srNo)
                            .jawType(jawType)
                            .photos(photoDetails)
                            .build();
                })
                .sorted(Comparator.comparingInt(AlignerPhotosByAlignerResponse::getAlignerSrNo))
                .collect(Collectors.toList());
    }

    private List<AlignerPhoto> createAlignerPhotosFromUpload(
            FileUploadDetails uploadDetails,
            Aligner aligner,
            long patientId,
            List<ChangeAlignerRequest.PhotoFileMapping> withAlignerMappings,
            List<ChangeAlignerRequest.PhotoFileMapping> withoutAlignerMappings) {

        List<AlignerPhoto> alignerPhotos = new ArrayList<>();

        Map<String, File> uploadedFilesMap = uploadDetails.getUploadFiles().stream()
                .collect(Collectors.toMap(File::getName, file -> file, (existing, replacement) -> existing));

        if (withAlignerMappings != null) {
            for (ChangeAlignerRequest.PhotoFileMapping mapping : withAlignerMappings) {
                File uploadedFile = uploadedFilesMap.get(mapping.getOriginalFilename());
                if (uploadedFile != null) {
                    try {
                        AlignerPhoto alignerPhoto =
                                createAlignerPhoto(uploadedFile, patientId, mapping.getSaveAsFilename(), aligner, true);
                        alignerPhotos.add(alignerPhoto);
                    } catch (Exception e) {
                        log.error("Failed to create aligner photo for: {}", mapping.getSaveAsFilename(), e);
                    }
                }
            }
        }

        if (withoutAlignerMappings != null) {
            for (ChangeAlignerRequest.PhotoFileMapping mapping : withoutAlignerMappings) {
                File uploadedFile = uploadedFilesMap.get(mapping.getOriginalFilename());
                if (uploadedFile != null) {
                    try {
                        AlignerPhoto alignerPhoto = createAlignerPhoto(
                                uploadedFile, patientId, mapping.getSaveAsFilename(), aligner, false);
                        alignerPhotos.add(alignerPhoto);
                    } catch (Exception e) {
                        log.error("Failed to create aligner photo for: {}", mapping.getSaveAsFilename(), e);
                    }
                }
            }
        }

        return alignerPhotos;
    }

    private AlignerPhoto createAlignerPhoto(
            File file, long patientId, String saveAsFilename, Aligner aligner, boolean withAligner) {

        Set<HasShared> newSet = new HashSet<>(file.getSharedWith());
        newSet.add(HasShared.PATIENT);
        file.setSharedWith(newSet);
        fileRepository.save(file);

        AlignerPhoto alignerPhoto;
        if (file.getIsGDrivePlatform()) {
            alignerPhoto = AlignerPhoto.fromPatient(
                    patientId,
                    String.format("patient/drive/image/%s", file.getDriveFileId()),
                    saveAsFilename,
                    aligner,
                    withAligner);
            alignerPhoto.setIsGDrivePlatform(true);
        } else {
            alignerPhoto = AlignerPhoto.fromPatient(patientId, file.getUrl(), saveAsFilename, aligner, withAligner);
            alignerPhoto.setIsGDrivePlatform(false);
        }

        aligner.getPhotos().add(alignerPhoto);
        alignerPhoto = alignerPhotoRepository.save(alignerPhoto);

        return alignerPhoto;
    }

    private void shareAlignerFolderIfNeeded(
            PatientDoctorOrganization patientDoctorOrganization, String parentPath, Patient patient) {

        GDriveStatus gDriveStatus = gDrivePlatformProvider.getGDriveStatus(patientDoctorOrganization);

        if (gDriveStatus.enabled
                && patient.getEmail() != null
                && !patient.getEmail().isEmpty()) {
            try {
                UserProfile userProfile = gDriveStatus.userProfile;
                googleDriveService.shareFile(
                        userProfile.getId(), parentPath, List.of(patient.getEmail()), "reader", null);
            } catch (Exception e) {
                log.error("Failed to share aligner folder with patient: {}", patient.getEmail(), e);
            }
        }
    }
}
