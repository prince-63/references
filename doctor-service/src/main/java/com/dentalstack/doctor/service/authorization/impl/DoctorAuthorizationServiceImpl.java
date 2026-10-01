package com.dentalstack.doctor.service.authorization.impl;

import com.dentalstack.doctor.repository.user.UserProfileRepository;
import com.dentalstack.doctor.service.authorization.DoctorAuthorizationService;
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
