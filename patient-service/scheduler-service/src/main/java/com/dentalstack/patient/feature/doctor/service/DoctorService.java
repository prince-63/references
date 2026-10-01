package com.dentalstack.patient.feature.doctor.service;

import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;

public interface DoctorService {

    DoctorDetails getDoctor(Long doctorId);
}
