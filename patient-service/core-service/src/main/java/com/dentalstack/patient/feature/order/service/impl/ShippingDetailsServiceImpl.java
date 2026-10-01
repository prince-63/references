package com.dentalstack.patient.feature.order.service.impl;

import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.order.dto.CreateShippingDetailsRequest;
import com.dentalstack.patient.feature.order.dto.ShippingDetails;
import com.dentalstack.patient.feature.order.dto.ShippingDetailsResponse;
import com.dentalstack.patient.feature.order.dto.UpdateShippingDetailsRequest;
import com.dentalstack.patient.feature.order.exception.ShippingDetailsNotFoundException;
import com.dentalstack.patient.feature.order.repository.ShippingDetailsRepository;
import com.dentalstack.patient.feature.order.service.ShippingDetailsService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ShippingDetailsServiceImpl implements ShippingDetailsService {
    private final ShippingDetailsRepository shippingDetailsRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional
    public ShippingDetailsResponse createShippingDetails(CreateShippingDetailsRequest request) {
        Long profileId = resolveProfileId(request.getProfileId());
        request.setProfileId(profileId);

        if (request.isDefault()) {
            shippingDetailsRepository.updatePreviousDefaultShippingDetails(profileId);
        }

        ShippingDetails shippingDetails = ShippingDetails.builder()
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

        ShippingDetails savedShippingDetails = shippingDetailsRepository.save(shippingDetails);
        log.info("Successfully created shipping details with ID: {}", savedShippingDetails.getId());

        return mapToResponse(savedShippingDetails);
    }

    @Override
    @Transactional
    public ShippingDetailsResponse updateShippingDetails(UpdateShippingDetailsRequest request) {
        Long profileId = resolveProfileId(request.getProfileId());
        request.setProfileId(profileId);

        var shippingId = request.getShippingId();
        ShippingDetails shippingDetails = getShippingDetailsOrThrow(shippingId);

        shippingDetails.setAddressedTo(request.getAddressedTo());
        shippingDetails.setName(request.getName());
        shippingDetails.setAddressLine(request.getAddressLine());
        shippingDetails.setCity(request.getCity());
        shippingDetails.setState(request.getState());
        shippingDetails.setCountry(request.getCountry());
        shippingDetails.setPincode(request.getPincode());
        shippingDetails.setMobileNumber(request.getMobileNumber());

        ShippingDetails updatedShippingDetails = shippingDetailsRepository.save(shippingDetails);
        log.info("Successfully updated shipping details with ID: {}", shippingId);

        return mapToResponse(updatedShippingDetails);
    }

    @Override
    @Transactional
    public ShippingDetailsResponse makeShippingDetailsDefault(Long shippingId, Long customerProfileId) {
        log.info("Making shipping details default with ID: {}", shippingId);

        ShippingDetails shippingDetails = getShippingDetailsOrThrow(shippingId);
        UserProfile userProfile = getUserProfileOrThrow(shippingDetails.getProfileId());

        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        shippingDetailsRepository.updatePreviousDefaultShippingDetails(shippingDetails.getProfileId());

        shippingDetails.setDefault(true);
        shippingDetails.setCustomerProfileId(customerProfileId);
        ShippingDetails updatedShippingDetails = shippingDetailsRepository.save(shippingDetails);

        log.info("Successfully set shipping details as default with ID: {}", shippingId);

        return mapToResponse(updatedShippingDetails);
    }

    @Override
    @Transactional(readOnly = true)
    public ShippingDetailsResponse getShippingDetailsById(Long shippingId) {
        log.info("Getting shipping details with ID: {}", shippingId);

        ShippingDetails shippingDetails = shippingDetailsRepository
                .findById(shippingId)
                .orElseThrow(() -> new ShippingDetailsNotFoundException(shippingId));

        return mapToResponse(shippingDetails);
    }

    @Override
    public ShippingDetailsResponse getDefaultShipping(Long profileId, Long customerProfileId) {
        Long resolvedProfileId = resolveProfileId(profileId);

        ShippingDetails shippingDetails;

        if (customerProfileId != null) {
            shippingDetails = shippingDetailsRepository
                    .findFirstByProfileIdAndCustomerProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(
                            resolvedProfileId, customerProfileId)
                    .orElseThrow(() -> new ShippingDetailsNotFoundException(resolvedProfileId));
        } else {
            shippingDetails = shippingDetailsRepository
                    .findFirstByProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(resolvedProfileId)
                    .orElseThrow(() -> new ShippingDetailsNotFoundException(resolvedProfileId));
        }

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

    private ShippingDetails getShippingDetailsOrThrow(Long shippingId) {
        return shippingDetailsRepository
                .findById(shippingId)
                .orElseThrow(() -> new ShippingDetailsNotFoundException(shippingId));
    }

    private ShippingDetailsResponse mapToResponse(ShippingDetails shippingDetails) {
        return ShippingDetailsResponse.builder()
                .shippingId(shippingDetails.getId())
                .profileId(shippingDetails.getProfileId())
                .addressedTo(shippingDetails.getAddressedTo())
                .name(shippingDetails.getName())
                .addressLine(shippingDetails.getAddressLine())
                .city(shippingDetails.getCity())
                .state(shippingDetails.getState())
                .country(shippingDetails.getCountry())
                .pincode(shippingDetails.getPincode())
                .mobileNumber(shippingDetails.getMobileNumber())
                .isDefault(shippingDetails.isDefault())
                .createdAt(shippingDetails.getCreatedAt())
                .build();
    }
}
