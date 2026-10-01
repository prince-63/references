package com.dentalstack.chat.service.email.impl;

import com.dentalstack.chat.dto.email.ConsentEmailReq;
import com.dentalstack.chat.enums.template.EmailTemplate;
import com.dentalstack.chat.service.email.ConsentEmailService;
import com.dentalstack.chat.service.email.EmailService;
import com.dentalstack.chat.util.StringUtil;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@AllArgsConstructor
public class ConsentEmailServiceImpl implements ConsentEmailService {
    private final EmailService emailService;
    private final StringUtil stringUtil;

    @Override
    public void sendConsentAcceptEmail(ConsentEmailReq req, MultipartFile file) {
        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("user_name", stringUtil.capitalizeWords(req.getUserName()));

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.CONSENT_ACCEPTED.getTemplateKey(), req.getOrgName());

        emailService.addAttachment(
                emailJson,
                file,
                String.format(
                        "Consent_%s_%s_%s.pdf",
                        stringUtil.capitalizeWords(req.getUserName()),
                        stringUtil.capitalizeWords(req.getConsentType()),
                        LocalDate.now()));
        try {
            emailService.sendEmail(emailJson);
        } catch (Exception e) {
            log.error("Error sending consent accepted email to patient: {}", e.getMessage());
        }
    }

    @Override
    public void sendConsentCopyToAdmin(ConsentEmailReq req, MultipartFile file) {
        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("patient_name", stringUtil.capitalizeWords(req.getPatientName()));
        mergeInfo.put("consent_type", stringUtil.capitalizeWords(req.getConsentType()));

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.ADMIN_CONSENT.getTemplateKey(), req.getOrgName());

        emailService.addAttachment(
                emailJson,
                file,
                String.format(
                        "Consent_%s_%s_%s.pdf",
                        stringUtil.capitalizeWords(req.getPatientName()),
                        stringUtil.capitalizeWords(req.getConsentType()),
                        LocalDate.now()));
        try {
            emailService.sendEmail(emailJson);
        } catch (Exception e) {
            log.error("Error sending consent accepted email to patient: {}", e.getMessage());
        }
    }
}
