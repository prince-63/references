package com.dentalstack.patient.feature.notification.service;

import com.dentalstack.patient.feature.notification.client.ChatServiceClient;
import com.dentalstack.patient.feature.notification.dto.planningcustomer.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Slf4j
public class PlanningCustomerEmailService {
    private final ChatServiceClient chatServiceClient;

    public void sendAddPatientEmail(AddPatientEmailRequest request) {
        try {
            chatServiceClient.sendAddPatientEmail(request);
            log.info("Feign call success: Add Patient email sent for patientId={}", request.getPatientId());
        } catch (Exception e) {
            log.error("Feign call failed: Add Patient email", e);
        }
    }

    public void sendNeedMoreInfoEmail(NeedMoreInfoEmailRequest request) {
        try {
            chatServiceClient.sendNeedMoreInfoEmail(request);
            log.info("Feign call success: Need More Info email sent for patientId={}", request.getPatientId());
        } catch (Exception e) {
            log.error("Feign call failed: Need More Info email", e);
        }
    }

    public void sendPlanReadyEmail(PlanReadyEmailRequest request) {
        try {
            chatServiceClient.sendPlanReadyEmail(request);
            log.info("Feign call success: Plan Ready email sent for patientId={}", request.getPatientId());
        } catch (Exception e) {
            log.error("Feign call failed: Plan Ready email", e);
        }
    }

    public void sendPlanApprovedEmail(PlanApprovedEmailRequest request) {
        try {
            chatServiceClient.sendPlanApprovedEmail(request);
            log.info("Feign call success: Plan Approved email sent for patientId={}", request.getPatientId());
        } catch (Exception e) {
            log.error("Feign call failed: Plan Approved email", e);
        }
    }

    public void sendRevisionEmail(InRevisionEmailRequest request) {
        try {
            chatServiceClient.sendInRevisionEmail(request);
            log.info("Feign call success: In Review email sent for patientId={}", request.getPatientId());
        } catch (Exception e) {
            log.error("Feign call failed: In Review email", e);
        }
    }

    public void sendStlFileUploadedEmail(StlFileUploadedEmailRequest request) {
        try {
            chatServiceClient.sendStlFileUploadedEmail(request);
            log.info("Feign call success: STL File Uploaded email sent for patientId={}", request.getPatientId());
        } catch (Exception e) {
            log.error("Feign call failed: STL File Uploaded email", e);
        }
    }

    public void sendCaseCompletedEmail(CaseCompletedEmailRequest request) {
        try {
            chatServiceClient.sendCaseCompletedEmail(request);
            log.info("Feign call success: Case Completed email sent for patientId={}", request.getPatientId());
        } catch (Exception e) {
            log.error("Feign call failed: Case Completed email", e);
        }
    }
}
