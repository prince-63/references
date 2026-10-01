package com.dentalstack.chat.service;

import com.dentalstack.chat.dto.chat.ChatPatientResponse;
import com.dentalstack.chat.dto.chat.PatientResponse;
import com.dentalstack.chat.dto.doctor.SuperAdminRequest;
import com.dentalstack.chat.dto.doctor.SuperAdminResponse;
import com.dentalstack.chat.dto.otp.UpdateMobileNumberRequest;
import com.dentalstack.chat.dto.patient.PatientDetails;
import com.dentalstack.chat.dto.patient.PatientForChatService;
import com.dentalstack.chat.dto.timeline.InactivateEventsRequest;
import com.dentalstack.chat.enums.UserType;
import com.dentalstack.chat.enums.event.EventType;
import com.dentalstack.chat.metadata.EventMetadata;
import java.util.List;

public interface PatientService {
    PatientForChatService callGetPatientForChat(Long patientId);

    ChatPatientResponse getPatientResponse(Long patientId);

    List<PatientResponse> getPatientResponseList(List<Long> patientId);

    void addEvent(
            Long userId,
            UserType userType,
            Long forUserId,
            UserType forUserType,
            EventType eventType,
            EventMetadata metadata);

    PatientDetails getPatientDetails(Long patientId);

    Long getAlignerJourneyIdOfPatient(Long patientId);

    String updateMobile(UpdateMobileNumberRequest request);

    String inactivateEvents(InactivateEventsRequest request);

    PatientDetails getPatientByEmail(String email);

    List<PatientResponse> getPatientDetailsForChatDashboard(Long doctorId, Long organizationId, Long profileId);

    String isWhatsAppEnabledForOrg(Long doctorId);

    SuperAdminResponse getSuperAdminDetails(SuperAdminRequest request);
}
