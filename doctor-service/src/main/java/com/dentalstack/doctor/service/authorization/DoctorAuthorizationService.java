package com.dentalstack.doctor.service.authorization;

public interface DoctorAuthorizationService {
    boolean isProfileOwnedByDoctor(Long tokenUserId, Long profileId);
}
