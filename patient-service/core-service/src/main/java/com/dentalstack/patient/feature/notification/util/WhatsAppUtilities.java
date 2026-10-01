package com.dentalstack.patient.feature.notification.util;

import com.dentalstack.patient.feature.notification.enums.MessageSendTo;
import com.dentalstack.patient.feature.notification.enums.OrgName;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import jakarta.annotation.Nullable;
import java.util.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class WhatsAppUtilities {

    private final PatientDoctorOrganizationRepository pdoRepository;
    private final UserProfileRepository userProfileRepository;

    public boolean isSupperAdmin(Long profileId) {
        return userProfileRepository.isSuperAdmin(profileId);
    }

    public boolean isAdmin(Long profileId) {
        return userProfileRepository.isAdmin(profileId);
    }

    public boolean isPlanningUser(Long profileId) {
        return userProfileRepository.isPlanningUser(profileId);
    }

    public boolean isProductionUser(Long profileId) {
        return userProfileRepository.isProductionUser(profileId);
    }

    public boolean isCustomer(Long profileId) {
        return userProfileRepository.isCustomer(profileId);
    }

    public boolean isCustomerByDoctorId(Long doctorId) {
        return userProfileRepository.isWhatsAppCustomerByDoctorId(doctorId);
    }

    public boolean isWhatsAppEnabled(Long profileId) {
        return userProfileRepository.isWhatsAppEnabled(profileId);
    }

    public boolean isWhatsAppEnabledByPatient(Long patientId) {
        return pdoRepository.isWhatsAppEnabledByPatientId(patientId);
    }

    public List<String> findAdminAndCustomerAndSuperAdminMobileNumberByPatient(Long patientId) {
        return pdoRepository.findAdminAndCustomerAndSuperAdminMobileNumberByPatient(patientId);
    }

    public List<String> findAdminAndCustomerMobileNumberByPatient(Long patientId) {
        return pdoRepository.findAdminAndCustomerMobileNumberByPatient(patientId);
    }

    public List<String> findSuperAdminAndCustomerMobileNumberByPatient(Long patientId) {
        return pdoRepository.findSuperAdminAndCustomerMobileNumberByPatient(patientId);
    }

    public List<String> findAdminAndSuperAdminMobileNumberByCustomer(Long customerProfileId) {
        return userProfileRepository.findAdminAndOwnerMobilesByCustomer(customerProfileId);
    }

    public List<String> resolveMobileNumber(Long profileId, Long patientId) {
        if (isCustomer(profileId)) {
            return findAdminAndSuperAdminMobileNumberByCustomer(profileId);
        } else if (isAdmin(profileId)) {
            return findSuperAdminAndCustomerMobileNumberByPatient(patientId);
        } else if (isSupperAdmin(profileId)) {
            return findAdminAndCustomerMobileNumberByPatient(patientId);
        }
        return List.of();
    }

    public List<String> resolveMobileNumberByPatient(Long patientId, Long profileId) {
        if (isWhatsAppEnabled(profileId)) {
            return findAdminAndCustomerAndSuperAdminMobileNumberByPatient(patientId);
        }
        return List.of();
    }

    public OrgName resolveOrgName(Long profileId) {
        Optional<String> orgName = userProfileRepository.findOrgName(profileId);

        if (orgName.isPresent()) {
            return ResolveOrgName.resolveOrgName(orgName.get());
        }

        return OrgName.DENTALSTACK;
    }

    public List<String> resolveMobileNumberOfSpecificUser(
            Long patientId, List<MessageSendTo> sendTo, @Nullable Long patientTaskTrackerId) {
        Set<String> mobileNumbers = new HashSet<>();

        sendTo.forEach(to -> {
            switch (to) {
                case SUPER_ADMIN -> mobileNumbers.addAll(pdoRepository.findSuperAdminMobileNumbersByPatient(patientId));
                case ADMIN -> mobileNumbers.addAll(pdoRepository.findAdminMobileNumbersByPatient(patientId));
                case CUSTOMER -> mobileNumbers.addAll(pdoRepository.findCustomerMobileNumbersByPatient(patientId));
                case ASSIGNED_USER -> mobileNumbers.addAll(
                        pdoRepository.findAssignedUserMobileNumbersByPatient(patientId, patientTaskTrackerId));
            }
        });

        return new ArrayList<>(mobileNumbers);
    }

    public List<String> resolveMobileNumberOfSpecificUser(Long patientId, List<MessageSendTo> sendTo) {

        return resolveMobileNumberOfSpecificUser(patientId, sendTo, null);
    }
}
