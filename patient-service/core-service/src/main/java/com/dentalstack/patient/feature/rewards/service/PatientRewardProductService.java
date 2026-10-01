package com.dentalstack.patient.feature.rewards.service;

import com.dentalstack.patient.feature.rewards.dto.response.PatientProductListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.PatientProductResponse;
import org.springframework.transaction.annotation.Transactional;

public interface PatientRewardProductService {

    @Transactional(readOnly = true)
    PatientProductListResponse getAvailableProducts(Long patientId, String category);

    @Transactional(readOnly = true)
    PatientProductResponse getProductDetails(Long patientId, Long productId);
}
