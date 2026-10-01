package com.dentalstack.doctor.service.impl;

import com.dentalstack.doctor.client.PatientServiceClient;
import com.dentalstack.doctor.dto.account.UpdateDoctorAccountRequest;
import com.dentalstack.doctor.entity.gettingstarted.GettingStarted;
import com.dentalstack.doctor.entity.user.ProfileImage;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.doctor.FileAction;
import com.dentalstack.doctor.enums.gettingstarted.GettingStartedEnum;
import com.dentalstack.doctor.enums.user.ProfileImageType;
import com.dentalstack.doctor.exception.doctor.DoctorNotFoundException;
import com.dentalstack.doctor.exception.file.FileSizeExceededException;
import com.dentalstack.doctor.mapper.DoctorMapper;
import com.dentalstack.doctor.mapper.UserProfileMapper;
import com.dentalstack.doctor.repository.DoctorRepository;
import com.dentalstack.doctor.repository.gettingstarted.GettingStartedRepository;
import com.dentalstack.doctor.repository.user.UserProfileRepository;
import com.dentalstack.doctor.service.*;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorV2ServiceImpl implements DoctorV2Service {
    private final DoctorRepository doctorRepository;
    private final UserProfileRepository userProfileRepository;
    private final GettingStartedRepository gettingStartedRepository;
    private final PatientServiceClient patientServiceClient;
    private final BlobUploadService blobUploadService;

    @Override
    @Transactional
    public UserProfile updateDoctorAccountDetails(
            UpdateDoctorAccountRequest request, MultipartFile file, MultipartFile displayProfileImage) {
        final long MAX_FILE_SIZE = 20 * 1024 * 1024;
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
        if (request.getFileActionProfile().equals(FileAction.REMOVE)) {
            userProfile.getUser().setProfileUrl(null);
            if (userProfile.getUser().getProfileImage() != null) {
                blobUploadService.removeImage(
                        userProfile.getUser().getProfileImage().getId());
            }
            userProfile.getUser().setProfileImage(null);
        }
        if (file != null
                && !Objects.requireNonNull(file.getOriginalFilename()).isEmpty()
                && request.getFileActionProfile().equals(FileAction.UPDATE)) {
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new FileSizeExceededException(file.getSize());
            }
            ProfileImage profileImage;
            if (userProfile.getUser().getProfileImage() != null) {
                profileImage = blobUploadService.uploadIntoDB(
                        userProfile.getUser().getProfileImage().getId(), file, ProfileImageType.COMPANY_PROFILE_IMAGE);
            } else {
                profileImage = blobUploadService.uploadIntoDB(null, file, ProfileImageType.COMPANY_PROFILE_IMAGE);
            }
            userProfile.getUser().setProfileImage(profileImage);
        }
        if (request.getFileActionDisplay().equals(FileAction.REMOVE)) {
            userProfile.getUser().setDisplayProfileUrl(null);
            if (userProfile.getUser().getDisplayProfileImage() != null) {
                blobUploadService.removeImage(
                        userProfile.getUser().getDisplayProfileImage().getId());
            }
            userProfile.getUser().setDisplayProfileImage(null);
        }
        if (displayProfileImage != null
                && !Objects.requireNonNull(displayProfileImage.getOriginalFilename())
                        .isEmpty()
                && request.getFileActionDisplay().equals(FileAction.UPDATE)) {
            if (displayProfileImage.getSize() > MAX_FILE_SIZE) {
                throw new FileSizeExceededException(displayProfileImage.getSize());
            }
            ProfileImage profileImage;
            if (userProfile.getUser().getDisplayProfileImage() != null) {
                profileImage = blobUploadService.uploadIntoDB(
                        userProfile.getUser().getDisplayProfileImage().getId(),
                        displayProfileImage,
                        ProfileImageType.DISPLAY_PROFILE_IMAGE);
            } else {
                profileImage = blobUploadService.uploadIntoDB(
                        null, displayProfileImage, ProfileImageType.DISPLAY_PROFILE_IMAGE);
            }
            userProfile.getUser().setDisplayProfileImage(profileImage);
        }

        UserProfileMapper.updateFromAccountRequest(userProfile, request);
        var profileId = request.getProfileId();
        var organizationId = request.getOrganizationId();
        var doctorId = request.getDoctorId();

        var doctor = doctorRepository
                .findById(request.getDoctorId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        DoctorMapper.updateDoctorAccount(doctor, request);
        doctorRepository.save(doctor);
        Optional<GettingStarted> existingPreference =
                gettingStartedRepository.findByProfileIdAndOrganizationIdAndGettingStartedEnum(
                        profileId, organizationId, GettingStartedEnum.BRAND_DETAILS_ADDED);

        if (existingPreference.isEmpty()) {
            GettingStarted newPreference = GettingStarted.builder()
                    .profileId(profileId)
                    .organizationId(organizationId)
                    .doctorId(doctorId)
                    .gettingStartedEnum(GettingStartedEnum.BRAND_DETAILS_ADDED)
                    .isEnabled(true)
                    .build();
            gettingStartedRepository.save(newPreference);
        }

        return userProfileRepository.save(userProfile);
    }
}
