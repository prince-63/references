package com.dentalstack.patient.feature.doctor.service;

import com.dentalstack.patient.feature.patient.enums.PendingActionEnum;
import java.util.Map;

public interface DoctorDashboardService {

    Map<PendingActionEnum, Integer> getPendingActionCounts(Long doctorId);
}
