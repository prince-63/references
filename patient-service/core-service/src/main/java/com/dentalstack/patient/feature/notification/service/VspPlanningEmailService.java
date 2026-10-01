package com.dentalstack.patient.feature.notification.service;

import com.dentalstack.patient.feature.notification.client.ChatServiceClient;
import com.dentalstack.patient.feature.notification.dto.vsp.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Slf4j
public class VspPlanningEmailService {

    private final ChatServiceClient chatServiceClient;

    public void sendVspCaseAssignedEmail(VspCaseAssignedEmailRequest request) {
        try {
            chatServiceClient.sendVspCaseAssignedEmail(request);
            log.info("Feign success: VSP Case Assigned email sent for patient={}", request.getPatientName());
        } catch (Exception e) {
            log.error("Feign failed: VSP Case Assigned email", e);
        }
    }

    public void sendVspCaseSubmittedEmail(VspCaseSubmittedEmailRequest request) {
        try {
            chatServiceClient.sendVspCaseSubmittedEmail(request);
            log.info("Feign success: VSP Case Submitted email sent for patient={}", request.getPatientName());
        } catch (Exception e) {
            log.error("Feign failed: VSP Case Submitted email", e);
        }
    }

    public void sendVspMoreInfoRequiredEmail(VspMoreInfoRequiredEmailRequest request) {
        try {
            chatServiceClient.sendVspMoreInfoRequiredEmail(request);
            log.info("Feign success: VSP More Info Required email sent for patient={}", request.getPatientName());
        } catch (Exception e) {
            log.error("Feign failed: VSP More Info Required email", e);
        }
    }

    public void sendVspPlanningCompletedEmail(VspPlanningCompletedEmailRequest request) {
        try {
            chatServiceClient.sendVspPlanningCompletedEmail(request);
            log.info("Feign success: VSP Planning Completed email sent for patient={}", request.getPatientName());
        } catch (Exception e) {
            log.error("Feign failed: VSP Planning Completed email", e);
        }
    }

    public void sendVspFilesUploadedEmail(VspFilesUploadedEmailRequest request) {
        try {
            chatServiceClient.sendVspFilesUploadedEmail(request);
            log.info("Feign success: VSP Files Uploaded email sent for patient={}", request.getPatientName());
        } catch (Exception e) {
            log.error("Feign failed: VSP Files Uploaded email", e);
        }
    }

    public void sendVspPlanReadyEmail(VspPlanReadyEmailRequest request) {
        try {
            chatServiceClient.sendVspPlanReadyEmail(request);
            log.info("Feign success: VSP Plan Ready email sent for patient={}", request.getPatientName());
        } catch (Exception e) {
            log.error("Feign failed: VSP Plan Ready email", e);
        }
    }

    public void sendVspPlanApprovedEmail(VspPlanApprovedEmailRequest request) {
        try {
            chatServiceClient.sendVspPlanApprovedEmail(request);
            log.info("Feign success: VSP Plan Approved email sent for patient={}", request.getPatientName());
        } catch (Exception e) {
            log.error("Feign failed: VSP Plan Approved email", e);
        }
    }

    public void sendVspRevisionRequestedEmail(VspRevisionRequestedEmailRequest request) {
        try {
            chatServiceClient.sendVspRevisionRequestedEmail(request);
            log.info("Feign success: VSP Revision Requested email sent for patient={}", request.getPatientName());
        } catch (Exception e) {
            log.error("Feign failed: VSP Revision Requested email", e);
        }
    }

    public void sendVspOrderShippedEmail(VspOrderShippedEmailRequest request) {
        try {
            chatServiceClient.sendVspOrderShippedEmail(request);
            log.info("Feign success: VSP Order Shipped email sent for patient={}", request.getPatientName());
        } catch (Exception e) {
            log.error("Feign failed: VSP Order Shipped email", e);
        }
    }

    public void sendVspProductionOrderCreatedEmail(VspProductionOrderCreatedEmailRequest request) {
        try {
            chatServiceClient.sendVspProductionOrderCreatedEmail(request);
            log.info("Feign success: VSP Production Order Created email sent for patient={}", request.getPatientName());
        } catch (Exception e) {
            log.error("Feign failed: VSP Production Order Created email", e);
        }
    }

    public void sendVspOrderDeliveredEmail(VspOrderDeliveredEmailRequest request) {
        try {
            chatServiceClient.sendVspOrderDeliveredEmail(request);
            log.info("Feign success: VSP Order Delivered email sent for patient={}", request.getPatientName());
        } catch (Exception e) {
            log.error("Feign failed: VSP Order Delivered email", e);
        }
    }

    public void sendVspNewMessageEmail(VspNewMessageEmailRequest request) {
        try {
            chatServiceClient.sendVspNewMessageEmail(request);
            log.info("Feign success: VSP New Message email sent for patient={}", request.getPatientName());
        } catch (Exception e) {
            log.error("Feign failed: VSP New Message email", e);
        }
    }
}
