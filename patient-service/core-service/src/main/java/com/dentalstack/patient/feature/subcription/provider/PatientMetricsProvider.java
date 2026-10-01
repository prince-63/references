package com.dentalstack.patient.feature.subcription.provider;

import com.dentalstack.patient.feature.patient.dto.PatientCount;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class PatientMetricsProvider {

    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;

    public PatientCount getActivePatientCount(Long doctorId, Long profileId) {
        try {
            Long activePatientCount =
                    patientDoctorOrganizationRepository.countActivePatientsByDoctorIdAndProfileId(doctorId, profileId);

            if (activePatientCount == null) {
                activePatientCount = 0L;
            }

            return PatientCount.builder().newActivePatient(activePatientCount).build();
        } catch (Exception e) {
            log.error("Error getting active patient count for doctorId: {}, profileId: {}", doctorId, profileId, e);
            return PatientCount.builder().newActivePatient(0L).build();
        }
    }

    public PatientCount getActivePatientCountByDoctorId(Long doctorId) {
        try {
            Long activePatientCount = patientDoctorOrganizationRepository.countActivePatientsByDoctorId(doctorId);

            if (activePatientCount == null) {
                activePatientCount = 0L;
            }

            return PatientCount.builder().newActivePatient(activePatientCount).build();
        } catch (Exception e) {
            log.error("Error getting active patient count for doctorId: {}", doctorId, e);
            return PatientCount.builder().newActivePatient(0L).build();
        }
    }
}
