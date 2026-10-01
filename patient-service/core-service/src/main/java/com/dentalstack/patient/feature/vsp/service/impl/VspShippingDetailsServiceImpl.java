package com.dentalstack.patient.feature.vsp.service.impl;

import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.vsp.dto.request.CreateVspShippingDetailsRequest;
import com.dentalstack.patient.feature.vsp.dto.request.UpdateVspShippingDetailsRequest;
import com.dentalstack.patient.feature.vsp.dto.response.VspShippingDetailsResponse;
import com.dentalstack.patient.feature.vsp.entity.VspShippingDetails;
import com.dentalstack.patient.feature.vsp.exception.VspShippingDetailsNotFoundException;
import com.dentalstack.patient.feature.vsp.repository.VspShippingDetailsRepository;
import com.dentalstack.patient.feature.vsp.service.VspShippingDetailsService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VspShippingDetailsServiceImpl implements VspShippingDetailsService {

    private final VspShippingDetailsRepository vspShippingDetailsRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional
    public VspShippingDetailsResponse createShippingDetails(CreateVspShippingDetailsRequest request) {
        Long profileId = resolveProfileId(request.getProfileId());
        request.setProfileId(profileId);

        if (request.isDefault()) {
            vspShippingDetailsRepository.updatePreviousDefaultShippingDetails(
                    profileId, request.getCustomerProfileId());
        }

        VspShippingDetails shippingDetails = VspShippingDetails.builder()
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

        VspShippingDetails savedShippingDetails = vspShippingDetailsRepository.save(shippingDetails);
        log.info("Successfully created VSP shipping details with ID: {}", savedShippingDetails.getId());
        return mapToResponse(savedShippingDetails);
    }

    @Override
    @Transactional
    public VspShippingDetailsResponse updateShippingDetails(UpdateVspShippingDetailsRequest request) {
        Long profileId = resolveProfileId(request.getProfileId());
        request.setProfileId(profileId);

        VspShippingDetails shippingDetails = vspShippingDetailsRepository
                .findById(request.getShippingId())
                .orElseThrow(() -> new VspShippingDetailsNotFoundException(request.getShippingId()));

        shippingDetails.setAddressedTo(request.getAddressedTo());
        shippingDetails.setName(request.getName());
        shippingDetails.setAddressLine(request.getAddressLine());
        shippingDetails.setCity(request.getCity());
        shippingDetails.setState(request.getState());
        shippingDetails.setCountry(request.getCountry());
        shippingDetails.setPincode(request.getPincode());
        shippingDetails.setMobileNumber(request.getMobileNumber());

        VspShippingDetails updatedShippingDetails = vspShippingDetailsRepository.save(shippingDetails);
        log.info("Successfully updated VSP shipping details with ID: {}", request.getShippingId());

        return mapToResponse(updatedShippingDetails);
    }

    @Override
    @Transactional(readOnly = true)
    public VspShippingDetailsResponse getDefaultShippingDetails(Long profileId) {
        log.info("Getting default VSP shipping details for profile: {}", profileId);
        VspShippingDetails shippingDetails = vspShippingDetailsRepository
                .findFirstByProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(profileId)
                .orElse(null);
        return mapToResponse(shippingDetails);
    }

    @Override
    @Transactional(readOnly = true)
    public VspShippingDetailsResponse getDefaultShippingDetails(Long profileId, Long customerProfileId) {
        profileId = resolveProfileId(profileId);
        VspShippingDetails shippingDetails = vspShippingDetailsRepository
                .findFirstByProfileIdAndCustomerProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(
                        profileId, customerProfileId)
                .orElseGet(() -> vspShippingDetailsRepository
                        .findFirstByCustomerProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(customerProfileId)
                        .orElse(null));
        return mapToResponse(shippingDetails);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VspShippingDetailsResponse> getShippingDetailsByProfile(Long profileId) {
        log.info("Getting all VSP shipping details for profile: {}", profileId);
        List<VspShippingDetails> shippingDetailsList =
                vspShippingDetailsRepository.findByProfileIdOrderByIsDefaultDescCreatedAtDesc(profileId);
        return shippingDetailsList.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VspShippingDetailsResponse getShippingDetailsById(String shippingId) {
        log.info("Getting VSP shipping details with ID: {}", shippingId);
        VspShippingDetails shippingDetails =
                vspShippingDetailsRepository.findById(shippingId).orElse(null);
        return mapToResponse(shippingDetails);
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

    private VspShippingDetailsResponse mapToResponse(VspShippingDetails shippingDetails) {
        return VspShippingDetailsResponse.from(shippingDetails);
    }
}
