package com.dentalstack.doctor.service.billing.impl;

import com.dentalstack.doctor.dto.S3.Feature;
import com.dentalstack.doctor.dto.billing.DoctorBillingDetails;
import com.dentalstack.doctor.dto.billing.DoctorBillingRequest;
import com.dentalstack.doctor.entity.billing.DoctorBilling;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.doctor.FileAction;
import com.dentalstack.doctor.exception.billing.DoctorBillingAlreadyExistException;
import com.dentalstack.doctor.exception.billing.DoctorBillingNotFoundException;
import com.dentalstack.doctor.exception.doctor.DoctorNotFoundException;
import com.dentalstack.doctor.mapper.DoctorBillingMapper;
import com.dentalstack.doctor.repository.billing.DoctorBillingRepository;
import com.dentalstack.doctor.repository.user.UserProfileRepository;
import com.dentalstack.doctor.service.FileService;
import com.dentalstack.doctor.service.billing.DoctorBillingService;
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
public class DoctorBillingServiceImpl implements DoctorBillingService {

    private final DoctorBillingRepository doctorBillingRepository;
    private final UserProfileRepository userProfileRepository;
    private final FileService fileService;

    @Override
    @Transactional
    public DoctorBilling addOrUpdateDoctorBillingDetails(
            DoctorBillingRequest request, MultipartFile file, MultipartFile companyBrandProfilePicture) {
        UserProfile userProfile = userProfileRepository
                .findById(request.getProfileId())
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
        } else if (FileAction.UPDATE.equals(request.getFileAction())) {
            Optional.ofNullable(file)
                    .filter(f ->
                            !Objects.requireNonNull(f.getOriginalFilename()).isEmpty())
                    .ifPresent(f -> {
                        String companyImageUrl = fileService.uploadFile(
                                f, Feature.BILLING_PROFILE, String.valueOf(request.getProfileId()));
                        doctorBilling.setCompanyImageUrl(companyImageUrl);
                    });
        }

        if (FileAction.REMOVE.equals(request.getFileBrandAction())) {
            doctorBilling.setCompanyBrandProfilePicture(null);
        } else if (FileAction.UPDATE.equals(request.getFileBrandAction())) {
            Optional.ofNullable(companyBrandProfilePicture)
                    .filter(f ->
                            !Objects.requireNonNull(f.getOriginalFilename()).isEmpty())
                    .ifPresent(f -> {
                        String brandProfilePicture = fileService.uploadFile(
                                f, Feature.BILLING_PROFILE, String.valueOf(request.getProfileId()));
                        doctorBilling.setCompanyBrandProfilePicture(brandProfilePicture);
                    });
        }

        doctorBilling.setUserProfile(userProfile);
        userProfile.setDoctorBilling(doctorBilling);

        userProfileRepository.save(userProfile);
        return doctorBillingRepository.save(doctorBilling);
    }

    @Override
    public DoctorBillingDetails getDoctorBillingDetails(long organizationId, long doctorId, long profileId) {
        return userProfileRepository
                .findBillingSummaryById(profileId)
                .map(DoctorBillingDetails::convertToDetails)
                .orElseThrow(() -> new DoctorBillingNotFoundException(doctorId));
    }
}
