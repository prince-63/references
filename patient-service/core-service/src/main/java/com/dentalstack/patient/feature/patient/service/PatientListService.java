package com.dentalstack.patient.feature.patient.service;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.patient.dto.*;
import jakarta.validation.Valid;

public interface PatientListService {
    ActivePatientDetailsWithPagination getPatientList(ActivePatientRequest request);

    LeadPatientDetailsWithPagination getLeadPatientList(ActivePatientRequest request);

    CombinedPatientResponseWithPagination getAllPatients(ActivePatientRequest request);

    PatientCountDTO getAllPatientMetrics(long doctorId, long organizationId, long profileId, DoctorRole role);

    PatientDetailsList getAllPatientsByStages(ActivePatientRequestV2 request);

    PatientCountResponse getPatientCount(ActivePatientRequestV2 request);

    CustomerPatientList getCustomerPatientList(@Valid CustomerPatientListRequest request);
}
