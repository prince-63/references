package com.dentalstack.patient.feature.notification.service.impl;

import com.dentalstack.patient.feature.notification.client.ChatServiceClient;
import com.dentalstack.patient.feature.notification.service.ConsentEmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@AllArgsConstructor
public class ConsentEmailServiceImpl implements ConsentEmailService {
    private final ChatServiceClient client;
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void sendConsentAcceptEmail(
            String userName, String consentType, String orgName, String email, MultipartFile file) {
        Map<String, Object> detailsMap = new HashMap<>();
        detailsMap.put("userName", userName);
        detailsMap.put("consentType", consentType);
        detailsMap.put("orgName", orgName);
        detailsMap.put("email", email);

        try {
            String details = mapper.writeValueAsString(detailsMap);
            client.sendConsentAcceptEmail(details, file);
        } catch (Exception ignored) {

        }
    }

    @Override
    public void sendConsentCopyToAdmin(
            String patientName, String consentType, String orgName, String email, MultipartFile file) {
        Map<String, Object> detailsMap = new HashMap<>();
        detailsMap.put("patientName", patientName);
        detailsMap.put("consentType", consentType);
        detailsMap.put("orgName", orgName);
        detailsMap.put("email", email);

        try {
            String details = mapper.writeValueAsString(detailsMap);
            client.sendConsentCopyToAdmin(details, file);
        } catch (Exception ignored) {

        }
    }
}
