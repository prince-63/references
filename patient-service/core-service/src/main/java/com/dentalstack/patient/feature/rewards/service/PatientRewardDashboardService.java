package com.dentalstack.patient.feature.rewards.service;

import com.dentalstack.patient.feature.rewards.dto.response.PatientRewardDashboardResponse;

public interface PatientRewardDashboardService {
    PatientRewardDashboardResponse getDashboard(Long patientId);
}
