package com.dentalstack.doctor.service.doctor;

import com.dentalstack.doctor.dto.chat.DoctorForChatService;
import com.dentalstack.doctor.dto.dashboard.DashboardCounts;
import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.dto.doctor.DoctorDetailsAll;
import com.dentalstack.doctor.dto.practicelocation.PLOfPatientResponse;
import com.dentalstack.doctor.dto.subscription.Subscription;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.PatientPracticeLocation;
import com.dentalstack.doctor.entity.PracticeLocation;
import com.dentalstack.doctor.entity.billing.DoctorBilling;
import com.dentalstack.doctor.exception.doctor.DoctorNotActiveException;
import com.dentalstack.doctor.exception.doctor.DoctorNotFoundException;
import com.dentalstack.doctor.exception.doctor.ErrorCode;
import com.dentalstack.doctor.exception.doctor.InvalidRequestException;
import com.dentalstack.doctor.repository.DoctorRepository;
import com.dentalstack.doctor.repository.PatientPracticeLocationRepository;
import com.dentalstack.doctor.repository.PracticeLocationRepository;
import com.dentalstack.doctor.repository.patient.PatientDoctorOrganizationRepository;
import com.dentalstack.doctor.service.PatientService;
import com.dentalstack.doctor.service.PracticeLocationService;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service responsible for doctor search and retrieval operations.
 * Extracted from DoctorServiceImpl to follow Single Responsibility Principle.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorSearchService {

    private final DoctorRepository doctorRepository;
    private final PracticeLocationRepository practiceLocationRepository;
    private final PracticeLocationService practiceLocationService;
    private final PatientService patientService;
    private final PatientPracticeLocationRepository patientPracticeLocationRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;

    @Transactional(readOnly = true)
    public DoctorDetailsAll getDoctorAllDetails(Long doctorId) {
        Doctor doctor = doctorRepository
                .findByIdWithAllDetails(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));
        Long totalClinic = practiceLocationService.getAllCount(doctorId);
        DashboardCounts dashboardCounts = null;
        try {
            dashboardCounts = patientService.getCountsForDoctor(doctorId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        Long activePatient = dashboardCounts.getActivePatient();
        Long totalPatient = dashboardCounts.getTotalPatient();
        long newActivePatient = dashboardCounts.getNewActivePatient();
        int totalNewPatient = dashboardCounts.getTotalNewPatient();
        List<Subscription> subscriptions = patientService.getSubscriptionDetails(doctorId);

        String plan = "free";
        return DoctorDetailsAll.from(
                doctor,
                activePatient,
                totalPatient,
                totalClinic,
                plan,
                newActivePatient,
                totalNewPatient,
                subscriptions);
    }

    public DoctorDetailsAll getDoctorAllDetailsForPatient(Long doctorId, Long patientId) {
        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(patientId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));
        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow(() -> new DoctorNotFoundException(doctorId));
        PLOfPatientResponse pLOfPatientResponse = practiceLocationService.getPracticeLocationByPatientId(patientId);
        DashboardCounts dashboardCounts = patientService.getCountsForDoctor(doctorId);
        Long activePatient = dashboardCounts.getActivePatient();
        Long totalPatient = dashboardCounts.getTotalPatient();
        long newActivePatient = dashboardCounts.getNewActivePatient();
        int totalNewPatient = dashboardCounts.getTotalNewPatient();

        String plan = "free";
        return DoctorDetailsAll.from(
                doctor,
                activePatient,
                totalPatient,
                pLOfPatientResponse,
                plan,
                newActivePatient,
                totalNewPatient,
                patientDoctorOrganization);
    }

    public DoctorDetails getDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow(() -> new DoctorNotFoundException(doctorId));
        Optional<PracticeLocation> practiceLocation =
                practiceLocationRepository.findByDoctorIdAndPracticeLocationTypeAndActiveTrue(
                        doctor.getId(), "Primary");
        String practiceLocationName = "";
        if (practiceLocation.isPresent()) {
            practiceLocationName = practiceLocation.get().getPracticeLocationName();
        }
        return DoctorDetails.fromDoctor(doctor, practiceLocationName);
    }

    public DoctorDetails getDoctorFoPatient(Long doctorId, Long patientId) {
        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow(() -> new DoctorNotFoundException(doctorId));
        Optional<PatientPracticeLocation> practiceLocation =
                patientPracticeLocationRepository.findByPatientIdAndActiveTrue(patientId);

        String practiceLocationName = null;
        String city = null;

        if (practiceLocation.isPresent() && practiceLocation.get().getPracticeLocation() != null) {
            practiceLocationName = practiceLocation.get().getPracticeLocation().getPracticeLocationName();
            city = practiceLocation.get().getPracticeLocation().getCity();
        }
        if (city == null && practiceLocationName == null) {
            Optional<PracticeLocation> practiceLocationOptional =
                    practiceLocationRepository.findByDoctorIdAndPracticeLocationTypeAndActiveTrue(doctorId, "Primary");
            if (practiceLocationOptional.isPresent()) {
                practiceLocationName = practiceLocationOptional.get().getPracticeLocationName();
                city = practiceLocationOptional.get().getCity();
            }
        }

        return DoctorDetails.fromDoctor(doctor, practiceLocationName, city);
    }

    public boolean findDoctorWithMobileNumber(String doctorMobile) {
        Optional<Doctor> doctorOptional = doctorRepository.findByMobileAndActiveTrue(doctorMobile);
        return doctorOptional.isPresent();
    }

    public boolean findDoctorWithMobileNumberAndOrg(String doctorMobile, String orgName) {
        Optional<Doctor> doctorOptional = doctorRepository.findByMobileAndOrgNameAndActiveTrue(doctorMobile, orgName);
        return doctorOptional.isPresent();
    }

    public DoctorForChatService getDoctorDetailsForChat(Long doctorId, Long patientId) {
        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(patientId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));
        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow(() -> new DoctorNotFoundException(doctorId));
        if (!doctor.isActive()) {
            throw new DoctorNotActiveException(doctorId);
        }
        DoctorForChatService doctorForChatService = new DoctorForChatService();
        DoctorBilling doctorBilling = patientDoctorOrganization.getUserProfile().getDoctorBilling();
        doctorForChatService.setDoctorMobile(doctor.getMobile());
        doctorForChatService.setDoctorName(
                doctorBilling != null
                        ? doctorBilling.getCompanyDisplayName()
                        : patientDoctorOrganization.getUserProfile().getUser().fullNameWithSalutation());
        doctorForChatService.setEmail(doctor.getEmail());
        doctorForChatService.setDoctorProfile(doctorBilling != null ? doctorBilling.getCompanyImageUrl() : null);
        doctorForChatService.setDoctorProfileId(
                doctorBilling != null && doctorBilling.getCompanyImage() != null
                        ? doctorBilling.getCompanyImage().getId()
                        : null);

        return doctorForChatService;
    }

    public DoctorDetails getDoctorDetailsByEmailOrMobileOrCode(String doctorCodeEmailMobile, String searchValueType) {
        if (searchValueType.equalsIgnoreCase("uid")) {
            Doctor doctor = doctorRepository
                    .findByUUIDAndActiveTrue(doctorCodeEmailMobile)
                    .orElseThrow(() ->
                            new InvalidRequestException(ErrorCode.BAD_REQUEST, "Doctor not found with doctor code"));
            Optional<PracticeLocation> practiceLocation =
                    practiceLocationRepository.findByDoctorIdAndPracticeLocationTypeAndActiveTrue(
                            doctor.getId(), "Primary");
            String practiceLocationName = "";
            if (practiceLocation.isPresent()) {
                practiceLocationName = practiceLocation.get().getPracticeLocationName();
            }
            return DoctorDetails.fromDoctor(doctor, practiceLocationName);
        } else if (searchValueType.equalsIgnoreCase("email")) {
            Doctor doctor = doctorRepository
                    .findByEmailAndActiveTrue(doctorCodeEmailMobile)
                    .orElseThrow(
                            () -> new InvalidRequestException(ErrorCode.BAD_REQUEST, "Doctor not found with email"));
            Optional<PracticeLocation> practiceLocation =
                    practiceLocationRepository.findByDoctorIdAndPracticeLocationTypeAndActiveTrue(
                            doctor.getId(), "Primary");
            String practiceLocationName = "";
            if (practiceLocation.isPresent()) {
                practiceLocationName = practiceLocation.get().getPracticeLocationName();
            }
            return DoctorDetails.fromDoctor(doctor, practiceLocationName);
        } else if (searchValueType.equalsIgnoreCase("mobile")) {
            Doctor doctor = doctorRepository
                    .findByMobileAndActiveTrue(doctorCodeEmailMobile)
                    .orElseThrow(
                            () -> new InvalidRequestException(ErrorCode.BAD_REQUEST, "Doctor not found with mobile"));
            Optional<PracticeLocation> practiceLocation =
                    practiceLocationRepository.findByDoctorIdAndPracticeLocationTypeAndActiveTrue(
                            doctor.getId(), "Primary");
            String practiceLocationName = "";
            if (practiceLocation.isPresent()) {
                practiceLocationName = practiceLocation.get().getPracticeLocationName();
            }
            return DoctorDetails.fromDoctor(doctor, practiceLocationName);
        }
        return null;
    }

    public DoctorDetails getDoctorByEmail(String emailId) {
        try {
            Doctor doctor =
                    doctorRepository.findByEmail(emailId).orElseThrow(() -> new DoctorNotFoundException(emailId));
            return DoctorDetails.from(doctor);
        } catch (DoctorNotFoundException e) {
            throw new DoctorNotFoundException(emailId);
        }
    }

    public Map<String, DoctorDetails> getDoctorsByEmails(List<String> emails) {
        if (emails == null || emails.isEmpty()) {
            return Collections.emptyMap();
        }
        return doctorRepository.findByEmailIn(emails).stream()
                .collect(Collectors.toMap(Doctor::getEmail, DoctorDetails::from));
    }

    public DoctorDetails getDoctorDetails(String emailId, Long organizationId, String xOrgName) {
        try {
            Doctor doctor = doctorRepository
                    .findByEmailAndOrgIdAndXOrgName(emailId, organizationId, xOrgName)
                    .orElseThrow(() -> new DoctorNotFoundException(emailId));
            return DoctorDetails.from(doctor);
        } catch (DoctorNotFoundException e) {
            throw new DoctorNotFoundException(emailId);
        }
    }
}
