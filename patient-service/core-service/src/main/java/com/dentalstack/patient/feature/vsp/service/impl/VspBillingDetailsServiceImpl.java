package com.dentalstack.patient.feature.vsp.service.impl;

import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.vsp.dto.request.CreateVspBillingDetailsRequest;
import com.dentalstack.patient.feature.vsp.dto.request.UpdateVspBillingDetailsRequest;
import com.dentalstack.patient.feature.vsp.dto.response.VspBillingDetailsResponse;
import com.dentalstack.patient.feature.vsp.entity.VspBillingDetails;
import com.dentalstack.patient.feature.vsp.exception.VspBillingDetailsNotFoundException;
import com.dentalstack.patient.feature.vsp.repository.VspBillingDetailsRepository;
import com.dentalstack.patient.feature.vsp.service.VspBillingDetailsService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VspBillingDetailsServiceImpl implements VspBillingDetailsService {

    private final VspBillingDetailsRepository vspBillingDetailsRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional
    public VspBillingDetailsResponse createBillingDetails(CreateVspBillingDetailsRequest request) {
        Long profileId = resolveProfileId(request.getProfileId());
        request.setProfileId(profileId);

        if (request.isDefault()) {
            vspBillingDetailsRepository.updatePreviousDefaultBillingDetails(profileId, request.getCustomerProfileId());
        }

        VspBillingDetails billingDetails = VspBillingDetails.builder()
                .profileId(profileId)
                .addressedTo(request.getAddressedTo())
                .name(request.getName())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .pincode(request.getPincode())
                .mobileNumber(request.getMobileNumber())
                .isDefault(request.isDefault())
                .customerProfileId(request.getCustomerProfileId())
                .build();

        VspBillingDetails savedBillingDetails = vspBillingDetailsRepository.save(billingDetails);
        log.info("Successfully created VSP billing details with ID: {}", savedBillingDetails.getId());
        return mapToResponse(savedBillingDetails);
    }

    @Override
    @Transactional
    public VspBillingDetailsResponse updateBillingDetails(UpdateVspBillingDetailsRequest request) {
        Long profileId = resolveProfileId(request.getProfileId());
        request.setProfileId(profileId);

        VspBillingDetails billingDetails = vspBillingDetailsRepository
                .findById(request.getBillingId())
                .orElseThrow(() -> new VspBillingDetailsNotFoundException(request.getBillingId()));

        billingDetails.setAddressedTo(request.getAddressedTo());
        billingDetails.setName(request.getName());
        billingDetails.setAddressLine(request.getAddressLine());
        billingDetails.setCity(request.getCity());
        billingDetails.setState(request.getState());
        billingDetails.setCountry(request.getCountry());
        billingDetails.setPincode(request.getPincode());
        billingDetails.setMobileNumber(request.getMobileNumber());

        VspBillingDetails updatedBillingDetails = vspBillingDetailsRepository.save(billingDetails);
        log.info("Successfully updated VSP billing details with ID: {}", request.getBillingId());

        return mapToResponse(updatedBillingDetails);
    }

    @Override
    @Transactional(readOnly = true)
    public VspBillingDetailsResponse getDefaultBillingDetails(Long profileId) {
        log.info("Getting default VSP billing details for profile: {}", profileId);
        VspBillingDetails billingDetails = vspBillingDetailsRepository
                .findFirstByProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(profileId)
                .orElse(null);
        return mapToResponse(billingDetails);
    }

    @Override
    @Transactional(readOnly = true)
    public VspBillingDetailsResponse getDefaultBillingDetails(Long profileId, Long customerProfileId) {
        profileId = resolveProfileId(profileId);
        log.info(
                "Getting default VSP billing details for profile: {} and customer profile: {}",
                profileId,
                customerProfileId);
        VspBillingDetails billingDetails = vspBillingDetailsRepository
                .findFirstByProfileIdAndCustomerProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(
                        profileId, customerProfileId)
                .orElseGet(() -> vspBillingDetailsRepository
                        .findFirstByCustomerProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(customerProfileId)
                        .orElse(null));
        return mapToResponse(billingDetails);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VspBillingDetailsResponse> getBillingDetailsByProfile(Long profileId) {
        log.info("Getting all VSP billing details for profile: {}", profileId);
        List<VspBillingDetails> billingDetailsList =
                vspBillingDetailsRepository.findByProfileIdOrderByIsDefaultDescCreatedAtDesc(profileId);
        return billingDetailsList.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VspBillingDetailsResponse getBillingDetailsById(String billingId) {
        log.info("Getting VSP billing details with ID: {}", billingId);
        VspBillingDetails billingDetails =
                vspBillingDetailsRepository.findById(billingId).orElse(null);
        return mapToResponse(billingDetails);
    }

    private Long resolveProfileId(Long profileId) {
        UserProfile userProfile = getUserProfileOrThrow(profileId);

        if (!userProfile.isOwner() && userProfile.getInviterProfile() != null) {
            return userProfile.getInviterProfile().getId();
        }

        return profileId;
    }

    private UserProfile getUserProfileOrThrow(Long profileId) {
        return userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(profileId));
    }

    private VspBillingDetailsResponse mapToResponse(VspBillingDetails billingDetails) {
        return VspBillingDetailsResponse.from(billingDetails);
    }
}
