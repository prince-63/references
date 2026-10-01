package com.dentalstack.doctor.service.profile.impl;

import com.dentalstack.doctor.client.AuthServiceClient;
import com.dentalstack.doctor.dto.AccountPasswordValidateRequest;
import com.dentalstack.doctor.dto.DoctorProfileRequest;
import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.dto.profile.DoctorProfileDetails;
import com.dentalstack.doctor.dto.profile.DoctorsProfileResponse;
import com.dentalstack.doctor.dto.profile.MarkProfileAsDefaultRequest;
import com.dentalstack.doctor.entity.subscription.SubscriptionPlan;
import com.dentalstack.doctor.entity.subscription.SubscriptionUserMapping;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.exception.UserWithEmailNotFoundException;
import com.dentalstack.doctor.exception.WrongPasswordException;
import com.dentalstack.doctor.exception.doctor.DoctorNotFoundException;
import com.dentalstack.doctor.repository.DoctorRepository;
import com.dentalstack.doctor.repository.chargebee.SubscriptionUserMappingRepository;
import com.dentalstack.doctor.repository.user.UserProfileRepository;
import com.dentalstack.doctor.service.profile.DoctorProfileManagementService;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorProfileManagementServiceImpl implements DoctorProfileManagementService {

    private final DoctorRepository doctorRepository;
    private final UserProfileRepository userProfileRepository;
    private final SubscriptionUserMappingRepository subscriptionUserMappingRepository;
    private final AuthServiceClient authServiceClient;

    @Override
    public List<DoctorProfileDetails> getDoctorProfile(Long doctorId, Long organizationId) {
        var doctor = doctorRepository
                .findByIdWithAllDetails(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));

        var userProfiles = doctor.getUserProfiles();

        return userProfiles.stream().map(DoctorProfileDetails::from).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DoctorDetails markProfileAsDefault(MarkProfileAsDefaultRequest request) {
        var userProfile = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        var doctor = doctorRepository
                .findById(request.getDoctorId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
        doctor.setPrimaryUserProfile(userProfile);
        return DoctorDetails.doctorDetails(doctorRepository.save(doctor));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorsProfileResponse> getProfiles(String email, String xOrgName) {
        List<UserProfile> userProfiles = userProfileRepository.findAllByEmail(email, xOrgName);

        if (userProfiles.isEmpty()) {
            throw new UserWithEmailNotFoundException("user with email " + email + " not found");
        }

        return userProfiles.stream()
                .map(u -> {
                    Optional<SubscriptionUserMapping> subscriptionUserMapping =
                            subscriptionUserMappingRepository.findByDoctorIdAndUserProfileId(
                                    u.getDoctor().getId(), u.getId());

                    DoctorsProfileResponse response = DoctorsProfileResponse.from(u);

                    if (subscriptionUserMapping.isPresent()) {
                        var subInstance = subscriptionUserMapping.get();
                        response.setIsSubscriptionPlanActive(isActive(subInstance.getSubscriptionPlan()));
                        response.setSubscriptionPlanName(subInstance
                                .getSubscriptionPlan()
                                .getPlanMetadata()
                                .getPlanName()
                                .name());
                    } else {
                        response.setIsSubscriptionPlanActive(false);
                    }

                    return response;
                })
                .sorted(Comparator.comparing(DoctorsProfileResponse::getIsSubscriptionPlanActive)
                        .reversed())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorsProfileResponse> getProfiles(DoctorProfileRequest request, String xOrgName) {
        List<UserProfile> userProfiles = userProfileRepository.findAllByEmail(request.getEmail(), xOrgName);

        if (userProfiles.isEmpty()) {
            throw new UserWithEmailNotFoundException("user with email " + request.getEmail() + " not found");
        }

        List<Long> organizationIds = authServiceClient.findMatchingAccount(AccountPasswordValidateRequest.builder()
                .email(request.getEmail())
                .password(request.getPassword())
                .xOrgName(xOrgName)
                .build());

        if (organizationIds.isEmpty()) {
            throw new WrongPasswordException("Wrong password provided for email " + request.getEmail());
        }

        return userProfiles.stream()
                .filter(u -> organizationIds.contains(u.getOrganization().getId()))
                .map(u -> {
                    Optional<SubscriptionUserMapping> subscriptionUserMapping =
                            subscriptionUserMappingRepository.findByDoctorIdAndUserProfileId(
                                    u.getDoctor().getId(), u.getId());

                    DoctorsProfileResponse response = DoctorsProfileResponse.from(u);

                    if (subscriptionUserMapping.isPresent()) {
                        var subInstance = subscriptionUserMapping.get();
                        response.setIsSubscriptionPlanActive(isActive(subInstance.getSubscriptionPlan()));
                        response.setSubscriptionPlanName(subInstance
                                .getSubscriptionPlan()
                                .getPlanMetadata()
                                .getPlanName()
                                .name());
                    } else {
                        response.setIsSubscriptionPlanActive(false);
                    }

                    return response;
                })
                .sorted(Comparator.comparing(DoctorsProfileResponse::getIsSubscriptionPlanActive)
                        .reversed())
                .toList();
    }

    private boolean isActive(SubscriptionPlan subscriptionPlan) {
        return subscriptionPlan.getPlanMetadata().getCurrentTermEnd().isAfter(ZonedDateTime.now());
    }
}
