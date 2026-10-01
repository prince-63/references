package com.dentalstack.patient.feature.smartbox.service;

import com.dentalstack.patient.feature.smartbox.dto.SmartBoxRequest;
import com.dentalstack.patient.feature.smartbox.dto.SmartBoxResponse;
import com.dentalstack.patient.feature.smartbox.entity.SmartBox;
import com.dentalstack.patient.feature.smartbox.exception.SmartBoxException;
import com.dentalstack.patient.feature.smartbox.repository.SmartBoxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class SmartBoxServiceImpl implements SmartBoxService {

    private final SmartBoxRepository smartBoxRepository;

    @Override
    public SmartBoxResponse getSmartBoxDetails(String patientId) {
        SmartBox smartBox = smartBoxRepository
                .findByPatientId(patientId)
                .orElseThrow(() -> new SmartBoxException("SmartBox not found for patientId: " + patientId));

        return SmartBox.buildResponse(smartBox);
    }

    @Override
    @Transactional
    public SmartBoxResponse registerSmartBox(SmartBoxRequest request) {
        SmartBox smartBox;

        if (request.getIsUpdate() != null && request.getIsUpdate()) {
            smartBox = smartBoxRepository
                    .findByPatientId(request.getPatientId())
                    .orElseThrow(() ->
                            new SmartBoxException("SmartBox not found with patient id: " + request.getPatientId()));
        } else {
            smartBox = new SmartBox();
        }
        SmartBox.setBasicFields(request, smartBox);
        SmartBox.setDeviceInfoFields(request, smartBox);

        if (smartBox.getIsSmartBoxEnable() == null) {
            smartBox.setIsSmartBoxEnable(true);
        }

        smartBoxRepository.save(smartBox);

        return SmartBox.buildResponse(smartBox);
    }
}
