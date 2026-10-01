package com.dentalstack.patient.feature.sampledata.service;

import com.dentalstack.patient.feature.sampledata.dto.SampleDataIds;

public interface SampleDataService {
    SampleDataIds getSampleDataIds();

    void deleteSampleData();

    SampleDataIds generateSampleDateIfRequired();
}
