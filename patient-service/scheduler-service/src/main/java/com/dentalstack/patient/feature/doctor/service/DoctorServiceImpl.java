package com.dentalstack.patient.feature.doctor.service;

import com.dentalstack.patient.application.client.DoctorServiceClient;
import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorServiceClient doctorServiceClient;

    @Override
    public DoctorDetails getDoctor(Long doctorId) {
        return doctorServiceClient.getDoctorDetail(doctorId);
    }
}
