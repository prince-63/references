package com.dentalstack.chat.service.impl;

import com.dentalstack.chat.client.PatientServiceClient;
import com.dentalstack.chat.dto.chat.ChatPatientResponse;
import com.dentalstack.chat.dto.chat.PatientResponse;
import com.dentalstack.chat.dto.doctor.SuperAdminRequest;
import com.dentalstack.chat.dto.doctor.SuperAdminResponse;
import com.dentalstack.chat.dto.otp.UpdateMobileNumberRequest;
import com.dentalstack.chat.dto.patient.PatientDetails;
import com.dentalstack.chat.dto.patient.PatientForChatService;
import com.dentalstack.chat.dto.timeline.AddEventRequest;
import com.dentalstack.chat.dto.timeline.InactivateEventsRequest;
import com.dentalstack.chat.enums.UserType;
import com.dentalstack.chat.enums.event.EventType;
import com.dentalstack.chat.metadata.EventMetadata;
import com.dentalstack.chat.service.PatientService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Service
@Slf4j
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientServiceClient patientServiceClient;

    @Override
    public PatientForChatService callGetPatientForChat(Long patientId) {
        return null;
    }

    @Override
    public ChatPatientResponse getPatientResponse(Long patientId) {
        return patientServiceClient.getPatientDetails(patientId);
    }

    @Override
    public List<PatientResponse> getPatientResponseList(List<Long> patientId) {
        return patientServiceClient.getPatientListResponse(patientId);
    }

    @Override
    public void addEvent(
            Long userId,
            UserType userType,
            Long forUserId,
            UserType forUserType,
            EventType eventType,
            EventMetadata metadata) {
        patientServiceClient.addEvent(
                new AddEventRequest(userId, userType, forUserId, forUserType, eventType, metadata));
    }

    @Override
    public PatientDetails getPatientDetails(Long patientId) {
        return patientServiceClient.getPatient(patientId);
    }

    @Override
    public Long getAlignerJourneyIdOfPatient(Long patientId) {
        return patientServiceClient.getAlignerJourneyIdOfPatient(patientId);
    }

    @Override
    public String updateMobile(@RequestBody UpdateMobileNumberRequest request) {
        return patientServiceClient.updateMobile(request);
    }

    @Override
    @PostMapping("/events/inactivate")
    public String inactivateEvents(@RequestBody InactivateEventsRequest request) {
        return patientServiceClient.inactivateEvents(request);
    }

    @Override
    public PatientDetails getPatientByEmail(String email) {
        return patientServiceClient.getPatientByEmail(email);
    }

    @Override
    public List<PatientResponse> getPatientDetailsForChatDashboard(Long doctorId, Long organizationId, Long profileId) {
        return patientServiceClient.getPatientDetailsForChatDashboard(doctorId, organizationId, profileId);
    }

    @Override
    public String isWhatsAppEnabledForOrg(Long doctorId) {
        return patientServiceClient.isWhatsAppMessagingDetails(doctorId);
    }

    @Override
    public SuperAdminResponse getSuperAdminDetails(SuperAdminRequest request) {
        return patientServiceClient.getSuperAdminDetails(request);
    }
}
