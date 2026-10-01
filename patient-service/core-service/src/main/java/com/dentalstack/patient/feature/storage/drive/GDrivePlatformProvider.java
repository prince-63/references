package com.dentalstack.patient.feature.storage.drive;

import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.storage.files.domain.GDriveStatus;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionPlan;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionUserMapping;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionUserMappingRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class GDrivePlatformProvider {

    private final SubscriptionUserMappingRepository subscriptionUserMappingRepository;
    private final FileRepository fileRepository;

    public boolean isGDrivePlatformEnabled(Long doctorId, Long profileId) {
        SubscriptionUserMapping mapping =
                subscriptionUserMappingRepository.findByDoctorIdAndUserProfileIdWithSubscriptionPlan(
                        profileId, doctorId);

        if (mapping != null) {
            SubscriptionPlan subscriptionPlan = mapping.getSubscriptionPlan();

            return subscriptionPlan != null && Boolean.TRUE.equals(subscriptionPlan.getIsGDrivePlatformEnabled());
        }

        return false;
    }

    public GDriveStatus getGDriveStatus(PatientDoctorOrganization patientDoctorOrganization) {
        GDriveStatus status = new GDriveStatus();
        status.enabled = false;
        status.userProfile = null;
        var up = patientDoctorOrganization.getUserProfile();
        if (up != null) {
            if (up.isOwner()) {
                status.userProfile = up;
                status.enabled = isGDrivePlatformEnabled(up.getDoctor().getId(), up.getId());
            } else if (up.getInviterProfile() != null) {
                var inv = up.getInviterProfile();
                status.userProfile = inv;
                status.enabled = isGDrivePlatformEnabled(inv.getDoctor().getId(), inv.getId());
            }
        }
        return status;
    }

    public List<File> findFilesForPatientOrdersOrDocumentsAndImages(Patient patient) {
        List<File> files =
                fileRepository.findAllFileWithMatchingPatient(patient.getId() + "_" + patient.tagFirstName());
        return new ArrayList<>(files);
    }
}
