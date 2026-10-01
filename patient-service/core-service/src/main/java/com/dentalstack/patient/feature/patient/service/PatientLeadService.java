package com.dentalstack.patient.feature.patient.service;

import com.dentalstack.patient.feature.doctor.dto.DashboardLeadDetails;
import com.dentalstack.patient.feature.patient.dto.*;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import java.util.List;

public interface PatientLeadService {

    List<DashboardLeadDetails> getWebLeadData(Long doctorId);

    DashboardLeadDetails getLeadProfileDetails(Long patientId);

    LeadProfileOverviewResponse getLeadProfileOverview(Long patientId, Long doctorId);

    void changeLeadStatus(long patientId, PatientStatus status);

    List<DashboardLeadDetails> getWebLead(GetWebLeadDataRequest request);

    List<DashboardLeadDetails> getWebLead(Long doctorId);

    List<ArchivedLeadDetails> getPatientWithStatus(Long doctorId, String patientStatus);

    List<ArchivedLeadDetails> getPatientWithStatus(ArchivedLeadRequest archivedLeadRequest);

    List<DashboardLeadDetails> filterPatients(FilterPatientsRequest request);

    DashboardLeadDetails updatePatient(UpdateLeadDetails req);

    void updatePatientTrackingStatus(PatientStatusChangeRequest request);

    PatientCurrStepResponse getPatientCurrentStep(Long patientId);

    PatientCurrStepResponse updatePatientCurrentStep(Long patientId, Long currentStep);
}
