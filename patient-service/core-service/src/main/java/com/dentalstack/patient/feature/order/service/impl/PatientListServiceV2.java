package com.dentalstack.patient.feature.order.service.impl;

import com.dentalstack.patient.feature.patient.dto.v2.PatientListRequestV2;
import com.dentalstack.patient.feature.patient.dto.v2.PatientListResponseV2;
import org.springframework.transaction.annotation.Transactional;

public interface PatientListServiceV2 {

    @Transactional(readOnly = true)
    PatientListResponseV2 getPatientListV2(PatientListRequestV2 request);
}
