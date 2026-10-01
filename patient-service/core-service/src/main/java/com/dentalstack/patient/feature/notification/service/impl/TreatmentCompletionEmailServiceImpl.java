package com.dentalstack.patient.feature.notification.service.impl;

import com.dentalstack.patient.feature.notification.client.ChatServiceClient;
import com.dentalstack.patient.feature.notification.service.TreatmentCompletionEmailService;
import com.dentalstack.patient.feature.treatment.dto.TreatmentCompletedEmailForOrgReq;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Slf4j
public class TreatmentCompletionEmailServiceImpl implements TreatmentCompletionEmailService {

    private final ChatServiceClient chatServiceClient;

    @Override
    public void sendTreatmentCompletedEmailToOrg(TreatmentCompletedEmailForOrgReq request) {
        try {
            chatServiceClient.sendTreatmentCompletedEmailToOrg(request);
        } catch (Exception e) {
            log.error("Failed to send treatment completed email to organization. Error: {}", e.getMessage());
        }
    }
}
