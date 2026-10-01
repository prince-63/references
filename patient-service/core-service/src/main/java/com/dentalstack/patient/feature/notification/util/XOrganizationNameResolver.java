package com.dentalstack.patient.feature.notification.util;

import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctor.entity.Doctor;
import com.dentalstack.patient.feature.doctor.repository.DoctorRepository;
import com.dentalstack.patient.feature.notification.dto.ResolveMultiOrgDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.user.entity.User;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class XOrganizationNameResolver {

    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final DoctorRepository doctorRepository;

    public ResolveMultiOrgDetails resolveFromPatient(Patient patient) {
        try {
            if (patient == null || patient.getId() == null) {
                return null;
            }
            var patientDoctorOrg =
                    patientDoctorOrganizationRepository.findPatientDoctorOrganizationsWithPatientByPatientId(
                            patient.getId());

            if (patientDoctorOrg.isPresent() && patientDoctorOrg.get().getUserProfile() != null) {
                var userProfile = patientDoctorOrg.get().getUserProfile();
                if (userProfile.getUser() != null) {
                    return ResolveMultiOrgDetails.builder()
                            .xOrgName(userProfile.getUser().getXOrganizationName())
                            .organizationId(userProfile.getUser().getOrganizationId())
                            .build();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to get organization name for patient: {}", e.getMessage());
        }
        return null;
    }

    public ResolveMultiOrgDetails resolveFromUser(User user) {
        try {
            if (user != null) {
                return ResolveMultiOrgDetails.builder()
                        .xOrgName(user.getXOrganizationName())
                        .organizationId(user.getOrganizationId())
                        .build();
            }
        } catch (Exception e) {
            log.warn("Failed to get organization name from user");
        }
        return null;
    }

    public ResolveMultiOrgDetails resolveFromUserProfile(UserProfile userProfile) {
        try {
            if (userProfile != null && userProfile.getUser() != null) {
                return ResolveMultiOrgDetails.builder()
                        .xOrgName(userProfile.getUser().getXOrganizationName())
                        .organizationId(userProfile.getUser().getOrganizationId())
                        .build();
            }
        } catch (Exception e) {
            log.warn("Failed to get organization name from user profile");
        }
        return null;
    }

    public ResolveMultiOrgDetails resolveFromDoctor(Doctor doctor) {
        try {
            if (doctor != null) {
                return ResolveMultiOrgDetails.builder()
                        .xOrgName(doctor.getXOrganizationName())
                        .organizationId(doctor.getOrganizationId())
                        .build();
            }
        } catch (Exception e) {
            log.warn("Failed to get organization name from doctor");
        }
        return null;
    }

    public ResolveMultiOrgDetails resolveFromDoctorDetails(DoctorDetails doctorDetails) {
        try {
            if (doctorDetails != null) {
                return ResolveMultiOrgDetails.builder()
                        .xOrgName(doctorDetails.getXOrganizationName())
                        .organizationId(doctorDetails.getOrganizationId())
                        .build();
            }
        } catch (Exception e) {
            log.warn("Failed to get organization name from doctor details");
        }
        return null;
    }

    public ResolveMultiOrgDetails resolveFromPatientId(Long patientId) {
        try {
            if (patientId == null) {
                return null;
            }
            var patientDoctorOrg =
                    patientDoctorOrganizationRepository.findPatientDoctorOrganizationsWithPatientByPatientId(patientId);

            if (patientDoctorOrg.isPresent() && patientDoctorOrg.get().getUserProfile() != null) {
                var userProfile = patientDoctorOrg.get().getUserProfile();
                if (userProfile.getUser() != null) {
                    return ResolveMultiOrgDetails.builder()
                            .xOrgName(userProfile.getUser().getXOrganizationName())
                            .organizationId(userProfile.getUser().getOrganizationId())
                            .build();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to get organization name for patient id {}: {}", patientId, e.getMessage());
        }
        return null;
    }

    public String resolveFromDoctorId(Long doctorId) {
        return doctorRepository
                .findById(doctorId)
                .map(Doctor::getXOrganizationName)
                .orElseGet(() -> {
                    log.warn("Failed to get organization name for doctor id {}", doctorId);
                    return null;
                });
    }
}
