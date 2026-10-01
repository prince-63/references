package com.dentalstack.doctor.service.impl;

import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.dto.sampledata.GenerateSampleDoctorRequest;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.DoctorPracticeLocation;
import com.dentalstack.doctor.entity.PracticeLocation;
import com.dentalstack.doctor.repository.DoctorRepository;
import com.dentalstack.doctor.repository.PracticeLocationRepository;
import com.dentalstack.doctor.service.SampleDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SampleDataServiceImpl implements SampleDataService {

    private static final String SAMPLE_DOCTOR_UUID = "D32457892";

    private final DoctorRepository doctorRepository;
    private final PracticeLocationRepository practiceLocationRepository;

    private static final String SAMPLE_DOCTOR_MOBILE_NO = "9773492655";

    @Override
    public DoctorDetails getSampleDoctor(GenerateSampleDoctorRequest request) {
        // This check is required otherwise multiple instances of patient service will try to generate same sample
        // data.
        var optionalDoc = doctorRepository.findByUUID(SAMPLE_DOCTOR_UUID);
        if (optionalDoc.isPresent()) {
            var doctor = optionalDoc.get();
            // Delete all doctor-patient mappings by this doctor.
            return DoctorDetails.from(doctor);
        }

        var email = "dentalstack8@gmail.com";
        var doctor = Doctor.builder()
                .firstName("Suraj")
                .lastName("Shetty")
                .countryCode("+91")
                .email(email)
                .mobile(SAMPLE_DOCTOR_MOBILE_NO)
                .countryName("India")
                .isOnBoardScreenVisited(true)
                .UUID(SAMPLE_DOCTOR_UUID)
                .active(true)
                .build();
        doctor = doctorRepository.save(doctor);

        var practiceLocation = PracticeLocation.builder()
                .practiceLocationName("Demo Clinic")
                .mobileNumber(SAMPLE_DOCTOR_MOBILE_NO)
                .emailId(email)
                .address(
                        "Shop No. 1, Neelkanth Palace, Garodia Nagar, Ghatkopar East, Mumbai, Maharashtra 400077, India")
                .doctorName("Demo Doctor")
                .practiceLocationInChargeDoctorName("Demo Doctor")
                .practiceLocationType("Primary")
                .pinCode(400077L)
                .city("Mumbai")
                .state("Maharashtra")
                .country("India")
                .active(true)
                .build();
        practiceLocation = practiceLocationRepository.save(practiceLocation);

        var doctorPracticeLocation = new DoctorPracticeLocation();
        doctorPracticeLocation.setActive(true);
        doctorPracticeLocation.setDoctor(doctor);
        doctorPracticeLocation.setPracticeLocation(practiceLocation);

        return DoctorDetails.from(doctor);
    }
}
