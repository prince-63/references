package com.dentalstack.patient.feature.doctor.service;

import com.dentalstack.patient.feature.doctor.dto.*;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountDetails;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountRequest;
import com.dentalstack.patient.feature.invitation.dto.PatientInvitationRequest;
import com.dentalstack.patient.feature.invitation.enums.Status;
import jakarta.validation.Valid;
import java.util.List;

public interface DoctorService {

    DoctorDetails getDoctor(Long doctorId);

    void registerPatientInvitation(PatientInvitationRequest request);

    void patientInvitationStatusChanged(long doctorId, long patientId, Status status);

    Long getPracticeLocationCount(long doctorId);

    PracticeLocationDetails getPracticeLocation(Long patientId);

    List<PLOfPatientResponse> getPracticeLocationOfPatient(List<Long> patientId);

    List<PLOfPatientResponse> getPracticeLocationOfPatientForFilter(List<Long> patientId);

    PLOfPatientResponse getPracticeLocationOfPatient(Long patientId);

    String getPendingInviteDetails(Long patientId, Long doctorId);

    DoctorDetails getSampleDoctor(Long patientId, Long alignerJourneyId);

    DoctorDetails doctorDetailsForPatient(Long doctorId, Long patientId);

    String assignPracticeLocationToPatientForApp(
            AssignPracticeLocationToPatientRequest assignPracticeLocationToPatientRequest);

    DoctorDetails getDoctorByEmail(String emailId);

    void removePatientPractice(Long patientId);

    DoctorInvitationCountDetails getInvitationCountOfAllRoles(DoctorInvitationCountRequest request);

    void deactivateSubscription(DeactivateSubscription request);

    MiniDashboardDetailsResponse getMiniDashboardDetails(MiniDashboardRequest request);

    MiniDashboardDetailsResponse getMiniDashboardDetails(Long profileId, Long organizationId);

    SuperAdminResponse getSuperAdminDetails(@Valid SuperAdminRequest request);

    MiniDashboardDetailsResponse getMiniDashboardDetailsForCustomer(MiniDashboardRequestForCustomer request);
}
