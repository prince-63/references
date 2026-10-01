package com.dentalstack.patient.feature.doctor.service;

public interface DoctorAuthorizationService {
    boolean isProfileOwnedByDoctor(Long tokenUserId, Long profileId);
}
