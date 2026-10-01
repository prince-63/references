package com.dentalstack.doctor.service.doctor;

import com.dentalstack.doctor.dto.S3.Feature;
import com.dentalstack.doctor.dto.account.UpdateDoctorAccountRequest;
import com.dentalstack.doctor.dto.doctor.UpdateDoctor;
import com.dentalstack.doctor.dto.doctor.UpdateDoctorForMobile;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.gettingstarted.GettingStarted;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.doctor.FileAction;
import com.dentalstack.doctor.enums.gettingstarted.GettingStartedEnum;
import com.dentalstack.doctor.exception.doctor.DoctorNotFoundException;
import com.dentalstack.doctor.exception.file.FileSizeExceededException;
import com.dentalstack.doctor.mapper.DoctorMapper;
import com.dentalstack.doctor.mapper.UserProfileMapper;
import com.dentalstack.doctor.repository.DoctorRepository;
import com.dentalstack.doctor.repository.gettingstarted.GettingStartedRepository;
import com.dentalstack.doctor.repository.user.UserProfileRepository;
import com.dentalstack.doctor.service.FileService;
import com.dentalstack.doctor.summary.UserProfileSummary;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service responsible for doctor account updates and retrieval.
 * Extracted from DoctorServiceImpl to follow Single Responsibility Principle.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorAccountService {

    private final DoctorRepository doctorRepository;
    private final UserProfileRepository userProfileRepository;
    private final GettingStartedRepository gettingStartedRepository;
    private final FileService fileService;

    @Transactional
    public Doctor updateDoctor(UpdateDoctor req, MultipartFile profileImage) {
        Doctor doctor = doctorRepository
                .findByIdAndActiveTrue(req.getDoctorId())
                .orElseThrow(() -> new DoctorNotFoundException(req.getDoctorId()));
        UpdateDoctor.updateForm(req, doctor);
        doctor = doctorRepository.save(doctor);
        return doctor;
    }

    @Transactional
    public Doctor updateDoctorForMobile(UpdateDoctorForMobile req, MultipartFile profileImage) {
        Doctor doctor = doctorRepository
                .findByIdAndActiveTrue(req.getDoctorId())
                .orElseThrow(() -> new DoctorNotFoundException(req.getDoctorId()));
        UpdateDoctor.updateDoctorForMobile(req, doctor);
        doctor = doctorRepository.save(doctor);
        return doctor;
    }

    @Transactional
    public UserProfile updateDoctorAccountDetails(
            UpdateDoctorAccountRequest request, MultipartFile file, MultipartFile displayProfileImage) {
        // 20MB in bytes
        final long MAX_FILE_SIZE = 20 * 1024 * 1024;

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        // Profile image handling
        if (request.getFileActionProfile().equals(FileAction.REMOVE)) {
            userProfile.getUser().setProfileUrl(null);
        }
        if (file != null
                && !Objects.requireNonNull(file.getOriginalFilename()).isEmpty()
                && request.getFileActionProfile().equals(FileAction.UPDATE)) {
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new FileSizeExceededException(file.getSize());
            }
            var companyImageUrl = fileService.uploadFile(
                    file, Feature.DOCTOR_ACCOUNT_PROFILE, request.getProfileId().toString());
            userProfile.getUser().setProfileUrl(companyImageUrl);
        }

        // Display profile image handling
        if (request.getFileActionDisplay().equals(FileAction.REMOVE)) {
            userProfile.getUser().setDisplayProfileUrl(null);
        }
        if (displayProfileImage != null
                && !Objects.requireNonNull(displayProfileImage.getOriginalFilename())
                        .isEmpty()
                && request.getFileActionDisplay().equals(FileAction.UPDATE)) {
            if (displayProfileImage.getSize() > MAX_FILE_SIZE) {
                throw new FileSizeExceededException(displayProfileImage.getSize());
            }
            var companyImageUrl = fileService.uploadFile(
                    displayProfileImage,
                    Feature.DOCTOR_ACCOUNT_DISPLAY_PROFILE,
                    request.getProfileId().toString());
            userProfile.getUser().setDisplayProfileUrl(companyImageUrl);
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

    public UserProfileSummary getDoctorAccountDetails(long organizationId, long doctorId, long profileId) {
        return userProfileRepository
                .findSummaryById(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));
    }
}
