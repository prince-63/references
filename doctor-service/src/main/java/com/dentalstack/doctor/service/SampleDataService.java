package com.dentalstack.doctor.service;

import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.dto.sampledata.GenerateSampleDoctorRequest;

public interface SampleDataService {
    DoctorDetails getSampleDoctor(GenerateSampleDoctorRequest request);
}
