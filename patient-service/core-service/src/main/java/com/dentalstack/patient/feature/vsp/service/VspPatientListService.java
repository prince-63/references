package com.dentalstack.patient.feature.vsp.service;

import com.dentalstack.patient.feature.vsp.dto.request.VspPatientListRequest;
import com.dentalstack.patient.feature.vsp.dto.response.VspPatientListResponse;
import org.springframework.transaction.annotation.Transactional;

public interface VspPatientListService {
    @Transactional(readOnly = true)
    VspPatientListResponse getVspPatientList(VspPatientListRequest request);
}
