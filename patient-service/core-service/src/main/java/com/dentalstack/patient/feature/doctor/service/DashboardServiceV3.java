package com.dentalstack.patient.feature.doctor.service;

import com.dentalstack.patient.feature.doctor.dto.*;
import jakarta.validation.Valid;

public interface DashboardServiceV3 {
    DoctorDashboardResponseV3 getDoctorDashboardData(@Valid DoctorDashboardRequest request);

    DoctorDashboardResponseV4 getDoctorDashboardDataV4(@Valid DoctorDashboardRequest request);

    MiniDashboardDetailsResponse getMiniDashboardDetails(MiniDashboardRequest request);
}
