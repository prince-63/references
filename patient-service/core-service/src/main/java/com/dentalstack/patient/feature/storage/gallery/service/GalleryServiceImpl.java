package com.dentalstack.patient.feature.storage.gallery.service;

import static com.dentalstack.patient.feature.storage.files.service.FilesService.CLEAR_ALIGNERS;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.AlignerPhoto;
import com.dentalstack.patient.feature.aligner.entity.PreAlignerPhoto;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.exception.aligner.AlignerJourneyNotFoundException;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.repository.AlignerPhotoRepository;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.storage.drive.GDrivePlatformProvider;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.storage.files.domain.FileUploadDetails;
import com.dentalstack.patient.feature.storage.files.domain.GDriveStatus;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderRequest;
import com.dentalstack.patient.feature.storage.files.dto.UploadFilesRequest;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.enums.HasShared;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.storage.gallery.dto.AddAlignerPhotoRequest;
import com.dentalstack.patient.feature.storage.gallery.dto.AddPreAlignerPhotoRequest;
import com.dentalstack.patient.feature.storage.gallery.dto.DeleteAlignerPhotosRequest;
import com.dentalstack.patient.feature.storage.gallery.exception.AlignerPhotoAlreadyExistsException;
import com.dentalstack.patient.feature.storage.gallery.exception.FailedToUploadAlignerPhotoException;
import com.dentalstack.patient.feature.storage.s3.AmazonS3Service;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.PhotosUploadedEventMetadata;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.exception.BadRequestException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class GalleryServiceImpl implements GalleryService {

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final AlignerPhotoRepository alignerPhotoRepository;
    private final AmazonS3Service amazonS3Service;
    private final TimelineService timelineService;
    private final FilesService filesService;
    private final PatientRepository patientRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final GDrivePlatformProvider gDrivePlatformProvider;
    private final GoogleDriveService googleDriveService;
    private final FileRepository fileRepository;

    @Value("${app.cloud.amazon.s3.bucket.gallery}")
    private String photosBucket;

    @Override
    public AlignerJourney uploadAlignerPhoto(
            AddAlignerPhotoRequest req, MultipartFile photo, String saveAsFilename, boolean sendEvents) {
        final Long alignerJourneyId = req.getAlignerJourneyId();
        final int alignerNo = req.getAlignerNo();

        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        Aligner aligner = alignerJourney.getAligner(alignerNo);
        if (aligner.getAlignerPhoto(saveAsFilename).isPresent()) {
            throw new AlignerPhotoAlreadyExistsException(saveAsFilename, alignerNo, alignerJourneyId);
        }

        FileUploadDetails uploadDetails = filesService.uploadFiles(
                getUploadRequest(alignerJourney, alignerNo), new MultipartFile[] {photo}, false);

        if (uploadDetails.getUploadFiles().isEmpty()) {
            throw new FailedToUploadAlignerPhotoException(
                    alignerJourney.getPatient().getId(), alignerJourneyId);
        }

        File file = uploadDetails.getUploadFiles().get(0);

        AlignerPhoto alignerPhoto = AlignerPhoto.from(req, file.getUrl(), saveAsFilename, aligner);
        alignerPhoto = alignerPhotoRepository.save(alignerPhoto);
        aligner.getPhotos().add(alignerPhoto);

        if (sendEvents) {
            if (!req.getUserType().equals(UserType.DOCTOR)) {
                timelineService.addEvent(
                        req.getUserId(),
                        UserType.PATIENT,
                        alignerJourney.getDoctorId(),
                        UserType.DOCTOR,
                        EventType.PHOTOS_UPLOADED,
                        new PhotosUploadedEventMetadata(req, AlignerJourneyDetails.from(alignerJourney)));
            }
        }

        return alignerJourneyRepository.save(alignerJourney);
    }

    private UploadFilesRequest getUploadRequest(AlignerJourney alignerJourney, int alignerNo) {
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
        owners.add(uploader);
        UserId patientOwner = new UserId();
        patientOwner.setUserId(alignerJourney.getPatient().getId());
        patientOwner.setUserType(UserType.PATIENT);
        UserId doctorOwner = new UserId();
        doctorOwner.setUserId(alignerJourney.getDoctorId());
        doctorOwner.setUserType(UserType.DOCTOR);
        owners.add(patientOwner);
        uploadRequest.setOwners(owners);

        return uploadRequest;
    }

    @Override
    public AlignerPhoto uploadPhotoByPatient(
            Aligner aligner, long patientId, String saveAsFilename, boolean withAligner, MultipartFile photo) {
        AlignerJourney alignerJourney = aligner.getAlignerJourney();
        long alignerJourneyId = alignerJourney.getId();
        int alignerNo = aligner.getSrNo();

        ensureAlignerFolderExists(alignerJourney, alignerNo);

        FileUploadDetails uploadDetails = filesService.uploadFiles(
                getUploadRequest(alignerJourney, alignerNo), new MultipartFile[] {photo}, false);

        if (uploadDetails.getUploadFiles().isEmpty()) {
            throw new FailedToUploadAlignerPhotoException(
                    alignerJourney.getPatient().getId(), alignerJourneyId);
        }

        File file = uploadDetails.getUploadFiles().get(0);

        AlignerPhoto alignerPhoto =
                AlignerPhoto.fromPatient(patientId, file.getUrl(), saveAsFilename, aligner, withAligner);
        aligner.getPhotos().add(alignerPhoto);

        alignerPhoto = alignerPhotoRepository.save(alignerPhoto);
        alignerJourneyRepository.save(alignerJourney);
        return alignerPhoto;
    }

    private void ensureAlignerFolderExists(AlignerJourney alignerJourney, int alignerNo) {
        TreatmentPlan treatmentPlan = alignerJourney.getTracking().getTreatmentPlan();
        Patient patient = alignerJourney.getPatient();
        long doctorId = alignerJourney.getDoctorId();

        UserId patientId = UserId.builder()
                .userId(patient.getId())
                .userType(UserType.PATIENT)
                .build();

        UserId doctorUserId =
                UserId.builder().userId(doctorId).userType(UserType.DOCTOR).build();

        Set<UserId> owners = Set.of(patientId, doctorUserId);

        filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                .folderName(CLEAR_ALIGNERS)
                .parentPath("/")
                .uploader(patientId)
                .owners(owners)
                .isDefaultFolder(true)
                .isPatientFolder(true)
                .build());

        filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                .folderName(treatmentPlan.getTreatmentPlanName())
                .parentPath(CLEAR_ALIGNERS)
                .uploader(patientId)
                .owners(owners)
                .isDefaultFolder(true)
                .isPatientFolder(true)
                .build());

        String treatmentPlanFolderPath = Paths.get("/" + CLEAR_ALIGNERS, treatmentPlan.getTreatmentPlanName())
                .toString();

        filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                .folderName(String.format("Aligner %d", alignerNo))
                .parentPath(treatmentPlanFolderPath)
                .uploader(patientId)
                .owners(owners)
                .isDefaultFolder(true)
                .isPatientFolder(true)
                .build());
    }

    @Override
    public AlignerPhoto uploadPhotoByPatientV2(
            Aligner aligner, long patientId, String saveAsFilename, boolean withAligner, MultipartFile photo) {
        PatientDoctorOrganization patientDoctorOrganization =
                patientDoctorOrganizationRepository.findByPatient(patientId);
        GDriveStatus gDriveStatus = gDrivePlatformProvider.getGDriveStatus(patientDoctorOrganization);
        boolean isEnabled = gDriveStatus.enabled;
        UserProfile userProfile = gDriveStatus.userProfile;
        Patient patient = patientDoctorOrganization.getPatient();
        AlignerJourney alignerJourney = aligner.getAlignerJourney();
        long alignerJourneyId = alignerJourney.getId();
        int alignerNo = aligner.getSrNo();

        FileUploadDetails uploadDetails = filesService.uploadFiles(
                getUploadRequest(alignerJourney, alignerNo), new MultipartFile[] {photo}, false);

        if (uploadDetails.getUploadFiles().isEmpty()) {
            throw new FailedToUploadAlignerPhotoException(
                    alignerJourney.getPatient().getId(), alignerJourneyId);
        }

        File file = uploadDetails.getUploadFiles().get(0);

        String fullPath = file.getFullPath();
        int lastSlashIndex = fullPath.lastIndexOf('/');
        String directoryPath = (lastSlashIndex > 0) ? fullPath.substring(0, lastSlashIndex + 1) : fullPath;

        if (isEnabled && !patient.getEmail().isEmpty()) {
            try {
                googleDriveService.shareFile(
                        userProfile.getId(),
                        directoryPath,
                        List.of(patient.getEmail()),
                        "reader",
                        file.getDriveFileId());
            } catch (Exception ignored) {

            }
        }

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
            alignerPhoto.setIsGDrivePlatform(file.getIsGDrivePlatform());
        } else {
            alignerPhoto = AlignerPhoto.fromPatient(patientId, file.getUrl(), saveAsFilename, aligner, withAligner);
            alignerPhoto.setIsGDrivePlatform(file.getIsGDrivePlatform());
        }
        aligner.getPhotos().add(alignerPhoto);
        alignerPhoto = alignerPhotoRepository.save(alignerPhoto);
        alignerJourneyRepository.save(alignerJourney);
        return alignerPhoto;
    }

    @Override
    public AlignerJourney uploadAlignerPhotos(AddAlignerPhotoRequest req, MultipartFile[] photos) {
        final Long alignerJourneyId = req.getAlignerJourneyId();
        if (photos == null) {
            throw new BadRequestException("No photos are attached");
        }

        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        AlignerJourney finalAlignerJourney = alignerJourney;
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() -> new PatientNotFoundException(
                        finalAlignerJourney.getPatient().getId()));
        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        for (var photo : photos) {
            alignerJourney = uploadAlignerPhoto(req, photo, req.saveAsFilename(photo.getOriginalFilename()), false);
        }

        if (!req.getUserType().equals(UserType.DOCTOR)) {
            timelineService.addEvent(
                    req.getUserId(),
                    UserType.PATIENT,
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.PHOTOS_UPLOADED,
                    new PhotosUploadedEventMetadata(req, AlignerJourneyDetails.from(alignerJourney)));
        }
        return alignerJourney;
    }

    @Override
    public AlignerJourney uploadPreAlignerPhotos(AddPreAlignerPhotoRequest req, MultipartFile[] photos) {
        final Long alignerJourneyId = req.getAlignerJourneyId();
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));
        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        final Long userId = alignerJourney.getPatient().getId();

        for (var photo : photos) {
            final String photoFilename = photo.getOriginalFilename();

            String imageUrl = null;
            final String key = getPhotoKey(userId, alignerJourneyId, -1, photoFilename);
            try {
                imageUrl = amazonS3Service.storeFile(photosBucket, key, photo);
            } catch (Exception e) {
                throw new FailedToUploadAlignerPhotoException(
                        alignerJourney.getPatient().getId(), alignerJourneyId);
            }

            PreAlignerPhoto preAlignerPhoto = PreAlignerPhoto.from(req, imageUrl, photoFilename, alignerJourney);
            alignerJourney.getPreAlignerPhotos().add(preAlignerPhoto);
        }

        return alignerJourneyRepository.save(alignerJourney);
    }

    @Override
    public List<AlignerPhoto> getAlignerPhotos(Long patientId) {
        AlignerJourney alignerJourney =
                alignerJourneyRepository
                        .findByPatientIdAndProgressStatus(patientId, ProgressStatus.IN_PROGRESS)
                        .stream()
                        .findAny()
                        .orElseThrow(() -> AlignerJourneyNotFoundException.ofPatientId(patientId));

        List<AlignerPhoto> photos = new ArrayList<>();
        alignerJourney
                .getAligners()
                .forEach(aligner ->
                        photos.addAll(alignerPhotoRepository.findByAlignerIdAndDeletedFalse(aligner.getId())));

        return photos;
    }

    @Override
    public List<AlignerPhoto> deleteAlignerPhoto(DeleteAlignerPhotosRequest request) {
        final Long alignerJourneyId = request.getAlignerJourneyId();
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));
        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        alignerJourney.getAligners().forEach(aligner -> aligner.getPhotos().stream()
                .filter(photo -> request.getAlignerPhotoIds().contains(photo.getId()))
                .forEach(photo -> {
                    photo.setDeleted(true);
                    photo.setDeletedBy(request.getUserId());
                    photo.setDeleterUserType(request.getDeleterUserType());
                }));

        alignerJourneyRepository.save(alignerJourney);
        return getAlignerPhotos(alignerJourney.getPatient().getId());
    }

    private String getPhotoKey(Long patientId, Long alignerJourneyId, int alignerNo, String fileName) {
        return String.join(
                "/",
                "gallery",
                Long.toString(patientId),
                Long.toString(alignerJourneyId),
                Long.toString(alignerNo),
                fileName);
    }
}
