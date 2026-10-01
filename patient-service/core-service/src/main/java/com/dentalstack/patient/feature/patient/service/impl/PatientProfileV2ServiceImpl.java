package com.dentalstack.patient.feature.patient.service.impl;

import static com.dentalstack.patient.feature.storage.files.service.FilesService.FILES_FOLDER_NAME;

import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.entity.ProfileImage;
import com.dentalstack.patient.feature.patient.enums.ProfileImageType;
import com.dentalstack.patient.feature.patient.exception.FailedToUploadPatientProfilePictureException;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.patient.repository.ProfileImageRepository;
import com.dentalstack.patient.feature.patient.service.PatientProfileV2Service;
import com.dentalstack.patient.feature.storage.drive.GDrivePlatformProvider;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.storage.files.domain.GDriveStatus;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.s3.AmazonS3Service;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class PatientProfileV2ServiceImpl implements PatientProfileV2Service {

    private final PatientRepository patientRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final AmazonS3Service amazonS3Service;
    private final GoogleDriveService googleDriveService;
    private final GDrivePlatformProvider gDrivePlatformProvider;
    private final FileRepository fileRepository;
    private final ProfileImageRepository profileImageRepository;

    @Value("${app.cloud.amazon.s3.bucket.patient}")
    private String profilePictureBucket;

    @Override
    @Transactional
    public Patient updateProfilePicture(Long patientId, MultipartFile photo) {
        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(patientId);

        if (pdo == null) {
            throw new PatientNotFoundException(patientId);
        }

        try {
            GDriveStatus gDriveStatus = gDrivePlatformProvider.getGDriveStatus(pdo);

            if (gDriveStatus.enabled) {
                String driveId = uploadToGoogleDrive(gDriveStatus.userProfile, patient, photo);
                patient.setProfilePictureUrl("patient/drive/image/" + driveId);
            } else {
                String s3Key = getProfilePictureKey(patientId, photo.getOriginalFilename());
                String s3Url = amazonS3Service.storeFile(profilePictureBucket, s3Key, photo);
                patient.setProfilePictureUrl(s3Url);
            }

            return patientRepository.save(patient);

        } catch (Exception e) {
            log.error("Failed to upload profile picture for patient {}", patientId, e);
            throw new FailedToUploadPatientProfilePictureException(patientId);
        }
    }

    @Override
    @Transactional
    public Patient updateProfilePictureUsingBlob(Long patientId, MultipartFile photo) {
        if (photo == null || photo.isEmpty()) {
            throw new IllegalArgumentException("Profile image cannot be empty");
        }

        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        try {
            ProfileImage profileImage = patient.getProfileImage();

            if (profileImage != null) {
                profileImage.setImageName(photo.getOriginalFilename());
                profileImage.setImageData(photo.getBytes());
                profileImage.setContentType(photo.getContentType());
            } else {
                profileImage = ProfileImage.builder()
                        .imageName(photo.getOriginalFilename())
                        .type(ProfileImageType.PATIENT)
                        .imageData(photo.getBytes())
                        .contentType(photo.getContentType())
                        .build();

                patient.setProfileImage(profileImage);
            }

            return patientRepository.save(patient);
        } catch (IOException ex) {
            throw new FailedToUploadPatientProfilePictureException(patientId);
        }
    }

    @Override
    public Optional<ProfileImage> findByProfilePictureId(Long profilePictureId) {
        return profileImageRepository.findById(profilePictureId);
    }

    @Override
    @Transactional
    public PatientDetails updateProfilePictureAndGetDetails(Long patientId, MultipartFile photo) {
        return PatientDetails.from(updateProfilePicture(patientId, photo));
    }

    @Override
    @Transactional
    public PatientDetails updateProfilePictureUsingBlobAndGetDetails(Long patientId, MultipartFile photo) {
        return PatientDetails.from(updateProfilePictureUsingBlob(patientId, photo));
    }

    private String uploadToGoogleDrive(UserProfile userProfile, Patient patient, MultipartFile photo) throws Exception {
        String rootPath = resolvePatientRootPath(patient);

        String filePath = Paths.get(rootPath, "profile_picture/" + photo.getOriginalFilename())
                .toString()
                .replace("\\", "/");

        OperationContext.UploadedChunkContext chunkContext =
                googleDriveService.storeFile(userProfile.getId(), filePath, photo);

        if (!patient.getEmail().isEmpty()) {
            googleDriveService.shareFile(
                    userProfile.getId(),
                    filePath,
                    List.of(patient.getEmail()),
                    "reader",
                    chunkContext.getDriveFileId());
        }
        return chunkContext.getDriveFileId();
    }

    private String resolvePatientRootPath(Patient patient) {
        String oldPath = Paths.get("patient", String.valueOf(patient.getId()), FILES_FOLDER_NAME, "Images")
                .toString()
                .replace("\\", "/");

        Optional<File> oldFile = fileRepository.findByFullPath(oldPath);
        if (oldFile.isPresent()) {
            return oldPath;
        }

        if (patient.tagFirstName() != null && !patient.tagFirstName().isBlank()) {
            String newPath = Paths.get(
                            "patient", patient.getId() + "_" + patient.tagFirstName(), FILES_FOLDER_NAME, "Images")
                    .toString()
                    .replace("\\", "/");

            Optional<File> newFile = fileRepository.findByFullPath(newPath);
            if (newFile.isPresent()) {
                return newPath;
            }

            return newPath;
        }

        return oldPath;
    }

    private String getProfilePictureKey(Long patientId, String fileName) {
        return String.join("/", "profile", String.valueOf(patientId), "profile_picture", fileName);
    }
}
