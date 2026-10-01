package com.dentalstack.patient.feature.doctor.service.impl;

import com.dentalstack.patient.feature.doctor.service.DoctorAuthorizationService;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Slf4j
@Service
public class DoctorAuthorizationServiceImpl implements DoctorAuthorizationService {

    private final UserProfileRepository userProfileRepository;

    @Override
    public boolean isProfileOwnedByDoctor(Long tokenUserId, Long profileId) {
        return !userProfileRepository.existsByIdAndDoctorId(profileId, tokenUserId);
    }
}
