package com.dentalstack.doctor.service.billing.impl;

import com.dentalstack.doctor.dto.billing.DoctorBillingDetails;
import com.dentalstack.doctor.dto.billing.DoctorBillingRequest;
import com.dentalstack.doctor.entity.billing.DoctorBilling;
import com.dentalstack.doctor.entity.user.ProfileImage;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.doctor.FileAction;
import com.dentalstack.doctor.enums.user.ProfileImageType;
import com.dentalstack.doctor.exception.billing.DoctorBillingAlreadyExistException;
import com.dentalstack.doctor.exception.billing.DoctorBillingNotFoundException;
import com.dentalstack.doctor.exception.doctor.DoctorNotFoundException;
import com.dentalstack.doctor.mapper.DoctorBillingMapper;
import com.dentalstack.doctor.repository.billing.DoctorBillingRepository;
import com.dentalstack.doctor.repository.chargebee.SubscriptionUserMappingRepository;
import com.dentalstack.doctor.repository.user.UserProfileRepository;
import com.dentalstack.doctor.service.BlobUploadService;
import com.dentalstack.doctor.service.billing.DoctorBillingV2Service;
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
public class DoctorBillingV2ServiceImpl implements DoctorBillingV2Service {
    private final DoctorBillingRepository doctorBillingRepository;
    private final UserProfileRepository userProfileRepository;
    private final BlobUploadService blobUploadService;
    private final SubscriptionUserMappingRepository subscriptionUserMappingRepository;

    @Override
    @Transactional
    public DoctorBillingDetails addOrUpdateDoctorBillingDetails(
            DoctorBillingRequest request, MultipartFile file, MultipartFile companyBrandProfilePicture) {
        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        DoctorBilling doctorBilling = Optional.ofNullable(request.getBillingId())
                .map(billingId -> doctorBillingRepository
                        .findById(billingId)
                        .map(existingBilling -> {
                            DoctorBillingMapper.updateFromRequest(existingBilling, request);
                            return existingBilling;
                        })
                        .orElseThrow(() -> new DoctorBillingNotFoundException(request.getBillingId())))
                .orElseGet(() -> {
                    if (userProfile.getDoctorBilling() != null) {
                        throw new DoctorBillingAlreadyExistException();
                    }
                    return DoctorBillingMapper.fromRequest(request);
                });

        if (FileAction.REMOVE.equals(request.getFileAction())) {
            doctorBilling.setCompanyImageUrl(null);
            if (doctorBilling.getCompanyImage() != null) {
                blobUploadService.removeImage(doctorBilling.getCompanyImage().getId());
            }
            doctorBilling.setCompanyImage(null);
        } else if (FileAction.UPDATE.equals(request.getFileAction())) {
            Optional.ofNullable(file)
                    .filter(f ->
                            !Objects.requireNonNull(f.getOriginalFilename()).isEmpty())
                    .ifPresent(f -> {
                        ProfileImage profileImage;
                        if (doctorBilling.getCompanyImage() != null) {
                            profileImage = blobUploadService.uploadIntoDB(
                                    doctorBilling.getCompanyImage().getId(), f, ProfileImageType.COMPANY_PROFILE_IMAGE);
                        } else {
                            profileImage =
                                    blobUploadService.uploadIntoDB(null, f, ProfileImageType.COMPANY_PROFILE_IMAGE);
                        }
                        doctorBilling.setCompanyImage(profileImage);
                    });
        }

        if (FileAction.REMOVE.equals(request.getFileBrandAction())) {
            doctorBilling.setCompanyBrandProfilePicture(null);
            if (doctorBilling.getCompanyBrandProfileImage() != null) {
                blobUploadService.removeImage(
                        doctorBilling.getCompanyBrandProfileImage().getId());
            }
            doctorBilling.setCompanyBrandProfileImage(null);
        } else if (FileAction.UPDATE.equals(request.getFileBrandAction())) {
            Optional.ofNullable(companyBrandProfilePicture)
                    .filter(f ->
                            !Objects.requireNonNull(f.getOriginalFilename()).isEmpty())
                    .ifPresent(f -> {
                        ProfileImage brandProfileImage;
                        if (doctorBilling.getCompanyBrandProfileImage() != null) {
                            brandProfileImage = blobUploadService.uploadIntoDB(
                                    doctorBilling.getCompanyBrandProfileImage().getId(),
                                    f,
                                    ProfileImageType.COMPANY_BRAND_PROFILE_IMAGE);
                        } else {
                            brandProfileImage = blobUploadService.uploadIntoDB(
                                    null, f, ProfileImageType.COMPANY_BRAND_PROFILE_IMAGE);
                        }
                        doctorBilling.setCompanyBrandProfileImage(brandProfileImage);
                    });
        }

        doctorBilling.setUserProfile(userProfile);
        userProfile.setDoctorBilling(doctorBilling);
        userProfileRepository.save(userProfile);
        DoctorBilling savedBillingDetails = doctorBillingRepository.save(doctorBilling);

        String planName = subscriptionUserMappingRepository.findPlanNameByDoctorId(request.getDoctorId());

        var response = DoctorBillingDetails.from(savedBillingDetails);
        response.setPlanName(planName);
        response.setProfileType(userProfile.getProfileType());
        return response;
    }
}
