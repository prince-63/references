package com.dentalstack.chat.service;

import com.dentalstack.chat.dto.email.planningcustomer.*;
import com.dentalstack.chat.enums.template.EmailTemplate;
import com.dentalstack.chat.service.email.EmailService;
import com.dentalstack.chat.util.StringUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlanningEmailService {

    private final EmailService emailService;
    private final StringUtil stringUtil;

    public void sendAddPatientEmail(AddPatientEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("practice_location", req.getPracticeLocation());
        mergeInfo.put("patient_id", req.getPatientId());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("patient_first_name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("patient_last_name", stringUtil.capitalizeWords(req.getPatientLastName()));
        mergeInfo.put("Patient_first_Name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("Patient_last_Name", stringUtil.capitalizeWords(req.getPatientLastName()));
        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(),
                mergeInfo,
                EmailTemplate.PLANNING_CUSTOMER_PATIENT_ADDED.getTemplateKey(),
                req.getOrgName());
        try {
            emailService.sendEmail(emailJson);
            log.info("Add Patient email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending Add Patient email: {}", e.getMessage(), e);
        }
    }

    public void sendNeedMoreInfoEmail(NeedMoreInfoEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("practice_location", req.getPracticeLocation());
        mergeInfo.put("lab_comments", req.getLabComments());
        mergeInfo.put("patient_id", req.getPatientId());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("patient_first_name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("patient_last_name", stringUtil.capitalizeWords(req.getPatientLastName()));
        mergeInfo.put("Patient_first_Name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("Patient_last_Name", stringUtil.capitalizeWords(req.getPatientLastName()));

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(),
                mergeInfo,
                EmailTemplate.PLANNING_CUSTOMER_NEED_MORE_INFO.getTemplateKey(),
                req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("Need More Info email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending Need More Info email: {}", e.getMessage(), e);
        }
    }

    public void sendPlanReadyEmail(PlanReadyEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("practice_location", req.getPracticeLocation());
        mergeInfo.put("wear_days", req.getWearDays());
        mergeInfo.put("patient_id", req.getPatientId());
        mergeInfo.put("series", req.getSeries());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("stages", req.getStages());
        mergeInfo.put("patient_first_name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("patient_last_name", stringUtil.capitalizeWords(req.getPatientLastName()));
        mergeInfo.put("plan_name", req.getPlanName());
        mergeInfo.put("remarks", req.getRemarks());
        mergeInfo.put("Patient_first_Name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("Patient_last_Name", stringUtil.capitalizeWords(req.getPatientLastName()));

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(),
                mergeInfo,
                EmailTemplate.PLANNING_CUSTOMER_PLAN_READY.getTemplateKey(),
                req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("Plan Ready email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending Plan Ready email: {}", e.getMessage(), e);
        }
    }

    public void sendPlanApprovedEmail(PlanApprovedEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("practice_location", req.getPracticeLocation());
        mergeInfo.put("wear_days", req.getWearDays());
        mergeInfo.put("patient_id", req.getPatientId());
        mergeInfo.put("series", req.getSeries());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("stages", req.getStages());
        mergeInfo.put("patient_first_name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("patient_last_name", stringUtil.capitalizeWords(req.getPatientLastName()));
        mergeInfo.put("plan_name", req.getPlanName());
        mergeInfo.put("remarks", req.getRemarks());
        mergeInfo.put("Patient_first_Name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("Patient_last_Name", stringUtil.capitalizeWords(req.getPatientLastName()));

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(),
                mergeInfo,
                EmailTemplate.PLANNING_CUSTOMER_PLAN_APPROVED.getTemplateKey(),
                req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("Plan Approved email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending Plan Approved email: {}", e.getMessage(), e);
        }
    }

    public void sendInRevisionEmail(InRevisionEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("practice_location", req.getPracticeLocation());
        mergeInfo.put("wear_days", req.getWearDays());
        mergeInfo.put("patient_id", req.getPatientId());
        mergeInfo.put("series", req.getSeries());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("stages", req.getStages());
        mergeInfo.put("plan_name", req.getPlanName());
        mergeInfo.put("remarks", req.getRemarks());
        mergeInfo.put("user_comments", req.getUserComments());
        mergeInfo.put("patient_first_name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("patient_last_name", stringUtil.capitalizeWords(req.getPatientLastName()));
        mergeInfo.put("Patient_first_Name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("Patient_last_Name", stringUtil.capitalizeWords(req.getPatientLastName()));

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(),
                mergeInfo,
                EmailTemplate.PLANNING_CUSTOMER_IN_REVISION.getTemplateKey(),
                req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("In Review email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending In Review email: {}", e.getMessage(), e);
        }
    }

    public void sendStlFileUploadedEmail(StlFileUploadedEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("practice_location", req.getPracticeLocation());
        mergeInfo.put("wear_days", req.getWearDays());
        mergeInfo.put("patient_id", req.getPatientId());
        mergeInfo.put("series", req.getSeries());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("stages", req.getStages());
        mergeInfo.put("plan_name", req.getPlanName());
        mergeInfo.put("remarks", req.getRemarks());
        mergeInfo.put("patient_first_name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("patient_last_name", stringUtil.capitalizeWords(req.getPatientLastName()));
        mergeInfo.put("Patient_first_Name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("Patient_last_Name", stringUtil.capitalizeWords(req.getPatientLastName()));

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(),
                mergeInfo,
                EmailTemplate.PLANNING_CUSTOMER_STL_FILE_UPLOADED.getTemplateKey(),
                req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("STL File Uploaded email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending STL File Uploaded email: {}", e.getMessage(), e);
        }
    }

    public void sendCaseCompletedEmail(CaseCompletedEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("practice_location", req.getPracticeLocation());
        mergeInfo.put("patient_id", req.getPatientId());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("patient_first_name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("patient_last_name", stringUtil.capitalizeWords(req.getPatientLastName()));
        mergeInfo.put("Patient_first_Name", stringUtil.capitalizeWords(req.getPatientFirstName()));
        mergeInfo.put("Patient_last_Name", stringUtil.capitalizeWords(req.getPatientLastName()));

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(),
                mergeInfo,
                EmailTemplate.PLANNING_CUSTOMER_CASE_COMPLETED.getTemplateKey(),
                req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("Case Completed email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending Case Completed email: {}", e.getMessage(), e);
        }
    }
}
