package com.dentalstack.patient.feature.notification.service;

import org.springframework.web.multipart.MultipartFile;

public interface ConsentEmailService {
    void sendConsentAcceptEmail(String userName, String consentType, String orgName, String email, MultipartFile file);

    void sendConsentCopyToAdmin(
            String patientName, String consentType, String orgName, String email, MultipartFile file);
}
