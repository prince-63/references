package com.dentalstack.patient.feature.rewards.service.impl;

import com.dentalstack.patient.feature.rewards.dto.response.PatientRewardDashboardResponse;
import com.dentalstack.patient.feature.rewards.service.PatientRewardDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientRewardDashboardServiceImpl implements PatientRewardDashboardService {

    @Override
    public PatientRewardDashboardResponse getDashboard(Long patientId) {
        return null;
    }
}
