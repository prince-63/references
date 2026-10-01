package com.dentalstack.patient.feature.doctor.service;

import com.dentalstack.patient.feature.aligner.dto.aligner.UpcomingAlignerChangesDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.PendingPatientActionCategorizedResponse;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.PendingPatientActionRequest;
import com.dentalstack.patient.feature.appointment.dto.MobileDashboardDoctorDetails;
import com.dentalstack.patient.feature.doctor.dto.*;
import com.dentalstack.patient.feature.doctor.dto.DoctorRequestForPatientDetails;
import com.dentalstack.patient.feature.invitation.dto.NotSetUpTreatmentPatient;
import com.dentalstack.patient.feature.notification.dto.ChatPatientResponse;
import com.dentalstack.patient.feature.patient.dto.PatientCount;
import com.dentalstack.patient.feature.patient.enums.PendingActionEnum;
import java.util.List;
import java.util.Map;

public interface DoctorDashboardService {

    DashboardCounts getCount(Long doctorId);

    List<DoctorPatientDetails> getPatientDetails(DoctorRequestForPatientDetails doctorRequestForPatientDetails);

    List<PatientResponse> getPatinetList(List<Long> patientId);

    ChatPatientResponse getPatientForChat(Long patientId);

    List<WaitingListPatientResponse> getWaitingListPatient(Long doctorId);

    List<NotSetUpTreatmentPatient> withoutTreatmentPatient(Long doctorId);

    Map<PendingActionEnum, Integer> getPendingActionCounts(Long doctorId);

    List<DoctorPatientDetails> filterPatients(FilterPatientRequest filterPatientRequest);

    Long getAlignerJourneyIdOfPatient(Long id);

    List<WaitingListPatientResponse> getWaitingListPatientNew(Long doctorId);

    MobileDashboardDoctorDetails getDoctorMobileDashboardData(Long doctorId);

    List<DashboardLeadDetails> getWebLeadData(Long doctorId);

    DoctorDashboardCount getDashboardCount(Long doctorId, Long organizationId, Long profileId);

    DoctorDashboardCount getDashboardCountForPatientMetrics(Long doctorId, Long organizationId, Long profileId);

    DoctorDashboardCount getDashboardCountForEnterprise(
            Long doctorId, Long organizationId, Long profileId, List<String> role);

    PatientCount activePatient(long doctorId);

    PatientCount activePatient(long doctorId, Long profileId);

    UpcomingAlignerChangesDetails upcomingAlignerChange(long doctorId, Long organizationId);

    PendingPatientActionCategorizedResponse pendingPatientActionResponse(PendingPatientActionRequest request);

    List<PatientResponse> getPatientDetailsForChatDashboard(Long doctorId, Long organizationId, Long profileId);

    DoctorDashboardResponse getDoctorDashboardData(DoctorDashboardRequest request);
}
