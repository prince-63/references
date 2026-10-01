package com.dentalstack.patient.feature.smartbox.service;

import com.dentalstack.patient.feature.smartbox.dto.SmartBoxRequest;
import com.dentalstack.patient.feature.smartbox.dto.SmartBoxResponse;
import jakarta.validation.Valid;

public interface SmartBoxService {
    SmartBoxResponse registerSmartBox(@Valid SmartBoxRequest request);

    SmartBoxResponse getSmartBoxDetails(String patientId);
}
