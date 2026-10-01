package com.dentalstack.chat.service;

import com.dentalstack.chat.config.WhatsappTemplateTypeProperties;
import com.dentalstack.chat.dto.email.vsp.*;
import com.dentalstack.chat.dto.whatsapp.WhatsAppRequest;
import com.dentalstack.chat.enums.OrgName;
import com.dentalstack.chat.enums.template.EmailTemplate;
import com.dentalstack.chat.service.email.EmailService;
import com.dentalstack.chat.service.whatsapp.WhatsAppService;
import com.dentalstack.chat.util.StringUtil;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class VspPlanningEmailService {

    private final EmailService emailService;
    private final StringUtil stringUtil;
    private final WhatsAppService whatsAppService;
    private final WhatsappTemplateTypeProperties whatsappTemplateTypeProperties;

    public void sendVspCustomerInvitationEmail(VspCustomerInvitationEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("customer_name", stringUtil.capitalizeWords(req.getCustomerName()));

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.VSP_CUSTOMER_INVITATION.getTemplateKey(), req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            if (req.getWhatsappEnabled()) {
                whatsAppService.sendTemplateMessage(WhatsAppRequest.builder()
                        .campaignName(whatsappTemplateTypeProperties.getVSP_CUSTOMER_INVITATION_SENT())
                        .destination(req.getMobileNo())
                        .templateParams(List.of(
                                req.getCustomerName(), req.getPortalUrl(), req.getInvitationCode() + "/connect"))
                        .userName("Route To Smile Healthcare Private Limited")
                        .source("new-landing-page form")
                        .orgName(OrgName.valueOf(req.getOrgName()))
                        .build());
            }
            log.info("VSP Customer Invitation email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP Customer Invitation email", e);
            throw new RuntimeException("Failed to send VSP customer invitation email", e);
        }
    }

    public void sendVspCaseAssignedEmail(VspCaseAssignedEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("product", req.getProduct());
        mergeInfo.put("assigned_user_name", stringUtil.capitalizeWords(req.getAssignedUserName()));
        mergeInfo.put("surgery_date", req.getSurgeryDate());
        mergeInfo.put("treatment_plan_instructions", req.getTreatmentPlanInstructions());
        mergeInfo.put("plan_needed_by", req.getPlanNeededBy());
        mergeInfo.put("orthodontist", req.getOrthodontist());
        mergeInfo.put("case_status", req.getCaseStatus());
        mergeInfo.put("oral_surgeon", req.getOralSurgeon());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("patient_name", stringUtil.capitalizeWords(req.getPatientName()));
        mergeInfo.put("days_to_plan", req.getDaysToPlan());
        mergeInfo.put("customer_name", stringUtil.capitalizeWords(req.getCustomerName()));
        mergeInfo.put("surgery_type", req.getSurgeryType());
        mergeInfo.put("days_to_surgery", req.getDaysToSurgery());

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.VSP_CASE_ASSIGNED.getTemplateKey(), req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("VSP Case Assigned email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP Case Assigned email", e);
            throw new RuntimeException("Failed to send VSP case assigned email", e);
        }
    }

    public void sendVspCaseSubmittedEmail(VspCaseSubmittedEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("product", req.getProduct());
        mergeInfo.put("surgery_date", req.getSurgeryDate());
        mergeInfo.put("treatment_plan_instructions", req.getTreatmentPlanInstructions());
        mergeInfo.put("plan_needed_by", req.getPlanNeededBy());
        mergeInfo.put("orthodontist", req.getOrthodontist());
        mergeInfo.put("case_status", req.getCaseStatus());
        mergeInfo.put("oral_surgeon", req.getOralSurgeon());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("patient_name", stringUtil.capitalizeWords(req.getPatientName()));
        mergeInfo.put("days_to_plan", req.getDaysToPlan());
        mergeInfo.put("customer_name", stringUtil.capitalizeWords(req.getCustomerName()));
        mergeInfo.put("surgery_type", req.getSurgeryType());
        mergeInfo.put("days_to_surgery", req.getDaysToSurgery());

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.VSP_CASE_SUBMITTED.getTemplateKey(), req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("VSP Case Submitted email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP Case Submitted email", e);
            throw new RuntimeException("Failed to send VSP case submitted email", e);
        }
    }

    public void sendVspMoreInfoRequiredEmail(VspMoreInfoRequiredEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("product", req.getProduct());
        mergeInfo.put("surgery_date", req.getSurgeryDate());
        mergeInfo.put("treatment_plan_instructions", req.getTreatmentPlanInstructions());
        mergeInfo.put("plan_needed_by", req.getPlanNeededBy());
        mergeInfo.put("orthodontist", req.getOrthodontist());
        mergeInfo.put("case_status", req.getCaseStatus());
        mergeInfo.put("oral_surgeon", req.getOralSurgeon());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("patient_name", stringUtil.capitalizeWords(req.getPatientName()));
        mergeInfo.put("days_to_plan", req.getDaysToPlan());
        mergeInfo.put("customer_name", stringUtil.capitalizeWords(req.getCustomerName()));
        mergeInfo.put("surgery_type", req.getSurgeryType());
        mergeInfo.put("lab_remarks", req.getLabRemarks());
        mergeInfo.put("days_to_surgery", req.getDaysToSurgery());

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.VSP_MORE_INFO_REQUIRED.getTemplateKey(), req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("VSP More Info Required email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP More Info Required email", e);
            throw new RuntimeException("Failed to send VSP more info required email", e);
        }
    }

    public void sendVspPlanningCompletedEmail(VspPlanningCompletedEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("product", req.getProduct());
        mergeInfo.put("orthodontist", req.getOrthodontist());
        mergeInfo.put("case_status", req.getCaseStatus());
        mergeInfo.put("oral_surgeon", req.getOralSurgeon());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("patient_name", stringUtil.capitalizeWords(req.getPatientName()));
        mergeInfo.put("surgery_date", req.getSurgeryDate());
        mergeInfo.put("customer_name", stringUtil.capitalizeWords(req.getCustomerName()));
        mergeInfo.put("surgery_type", req.getSurgeryType());
        mergeInfo.put("days_to_surgery", req.getDaysToSurgery());

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.VSP_PLANNING_COMPLETED.getTemplateKey(), req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("VSP Planning Completed email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP Planning Completed email", e);
            throw new RuntimeException("Failed to send VSP planning completed email", e);
        }
    }

    public void sendVspFilesUploadedEmail(VspFilesUploadedEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("patient_name", stringUtil.capitalizeWords(req.getPatientName()));
        mergeInfo.put("customer_name", stringUtil.capitalizeWords(req.getCustomerName()));

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.VSP_FILES_UPLOADED.getTemplateKey(), req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("VSP Files Uploaded email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP Files Uploaded email", e);
            throw new RuntimeException("Failed to send VSP files uploaded email", e);
        }
    }

    public void sendVspPlanReadyEmail(VspPlanReadyEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("product", req.getProduct());
        mergeInfo.put("surgery_date", req.getSurgeryDate());
        mergeInfo.put("plan_options", req.getPlanOptions());
        mergeInfo.put("plan_name", req.getPlanName());
        mergeInfo.put("user_email_id", req.getUserEmailId());
        mergeInfo.put("orthodontist", req.getOrthodontist());
        mergeInfo.put("case_status", req.getCaseStatus());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("oral_surgeon", req.getOralSurgeon());
        mergeInfo.put("patient_name", stringUtil.capitalizeWords(req.getPatientName()));
        mergeInfo.put("customer_name", stringUtil.capitalizeWords(req.getCustomerName()));
        mergeInfo.put("surgery_type", req.getSurgeryType());
        mergeInfo.put("lab_remarks", req.getLabRemarks());
        mergeInfo.put("plan_status", req.getPlanStatus());
        mergeInfo.put("days_to_surgery", req.getDaysToSurgery());

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.VSP_PLAN_READY.getTemplateKey(), req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("VSP Plan Ready email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP Plan Ready email", e);
            throw new RuntimeException("Failed to send VSP plan ready email", e);
        }
    }

    public void sendVspPlanApprovedEmail(VspPlanApprovedEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("product", req.getProduct());
        mergeInfo.put("surgery_date", req.getSurgeryDate());
        mergeInfo.put("plan_name", req.getPlanName());
        mergeInfo.put("approved_option", req.getApprovedOption());
        mergeInfo.put("user_email_id", req.getUserEmailId());
        mergeInfo.put("orthodontist", req.getOrthodontist());
        mergeInfo.put("case_status", req.getCaseStatus());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("oral_surgeon", req.getOralSurgeon());
        mergeInfo.put("patient_name", stringUtil.capitalizeWords(req.getPatientName()));
        mergeInfo.put("customer_name", stringUtil.capitalizeWords(req.getCustomerName()));
        mergeInfo.put("surgery_type", req.getSurgeryType());
        mergeInfo.put("plan_status", req.getPlanStatus());
        mergeInfo.put("days_to_surgery", req.getDaysToSurgery());

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.VSP_PLAN_APPROVED.getTemplateKey(), req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("VSP Plan Approved email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP Plan Approved email", e);
            throw new RuntimeException("Failed to send VSP plan approved email", e);
        }
    }

    public void sendVspRevisionRequestedEmail(VspRevisionRequestedEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("product", req.getProduct());
        mergeInfo.put("surgery_date", req.getSurgeryDate());
        mergeInfo.put("revision_request_target", req.getRevisionRequestTarget());
        mergeInfo.put("plan_name", req.getPlanName());
        mergeInfo.put("user_email_id", req.getUserEmailId());
        mergeInfo.put("orthodontist", req.getOrthodontist());
        mergeInfo.put("case_status", req.getCaseStatus());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("oral_surgeon", req.getOralSurgeon());
        mergeInfo.put("patient_name", stringUtil.capitalizeWords(req.getPatientName()));
        mergeInfo.put("customer_remarks", req.getCustomerRemarks());
        mergeInfo.put("customer_name", stringUtil.capitalizeWords(req.getCustomerName()));
        mergeInfo.put("surgery_type", req.getSurgeryType());
        mergeInfo.put("plan_status", req.getPlanStatus());
        mergeInfo.put("days_to_surgery", req.getDaysToSurgery());

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.VSP_REVISION_REQUESTED.getTemplateKey(), req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("VSP Revision Requested email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP Revision Requested email", e);
            throw new RuntimeException("Failed to send VSP revision requested email", e);
        }
    }

    public void sendVspOrderShippedEmail(VspOrderShippedEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("product", req.getProduct());
        mergeInfo.put("surgery_date", req.getSurgeryDate());
        mergeInfo.put("products_and_quantity", req.getProductsAndQuantity());
        mergeInfo.put("user_email_id", req.getUserEmailId());
        mergeInfo.put("orthodontist", req.getOrthodontist());
        mergeInfo.put("shipped_on", req.getShippedOn());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("oral_surgeon", req.getOralSurgeon());
        mergeInfo.put("patient_name", stringUtil.capitalizeWords(req.getPatientName()));
        mergeInfo.put("tracking_number", req.getTrackingNumber());
        mergeInfo.put("customer_name", stringUtil.capitalizeWords(req.getCustomerName()));
        mergeInfo.put("shipping_address", req.getShippingAddress());
        mergeInfo.put("shipping_name", req.getShippingName());
        mergeInfo.put("surgery_type", req.getSurgeryType());
        mergeInfo.put("tracking_link", req.getTrackingLink());
        mergeInfo.put("days_to_surgery", req.getDaysToSurgery());

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.VSP_ORDER_SHIPPED.getTemplateKey(), req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("VSP Order Shipped email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP Order Shipped email", e);
            throw new RuntimeException("Failed to send VSP order shipped email", e);
        }
    }

    public void sendVspProductionOrderCreatedEmail(VspProductionOrderCreatedEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("product", req.getProduct());
        mergeInfo.put("surgery_date", req.getSurgeryDate());
        mergeInfo.put("products_and_quantity", req.getProductsAndQuantity());
        mergeInfo.put("order_status", req.getOrderStatus());
        mergeInfo.put("production_remarks", req.getProductionRemarks());
        mergeInfo.put("orthodontist", req.getOrthodontist());
        mergeInfo.put("created_on", req.getCreatedOn());
        mergeInfo.put("case_status", req.getCaseStatus());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("oral_surgeon", req.getOralSurgeon());
        mergeInfo.put("patient_name", stringUtil.capitalizeWords(req.getPatientName()));
        mergeInfo.put("customer_name", stringUtil.capitalizeWords(req.getCustomerName()));
        mergeInfo.put("surgery_type", req.getSurgeryType());
        mergeInfo.put("days_to_surgery", req.getDaysToSurgery());

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(),
                mergeInfo,
                EmailTemplate.VSP_PRODUCTION_ORDER_CREATED.getTemplateKey(),
                req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("VSP Production Order Created email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP Production Order Created email", e);
            throw new RuntimeException("Failed to send VSP production order created email", e);
        }
    }

    public void sendVspOrderDeliveredEmail(VspOrderDeliveredEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("product", req.getProduct());
        mergeInfo.put("delivered_on", req.getDeliveredOn());
        mergeInfo.put("surgery_date", req.getSurgeryDate());
        mergeInfo.put("products_and_quantity", req.getProductsAndQuantity());
        mergeInfo.put("user_email_id", req.getUserEmailId());
        mergeInfo.put("orthodontist", req.getOrthodontist());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("oral_surgeon", req.getOralSurgeon());
        mergeInfo.put("patient_name", stringUtil.capitalizeWords(req.getPatientName()));
        mergeInfo.put("tracking_number", req.getTrackingNumber());
        mergeInfo.put("customer_name", stringUtil.capitalizeWords(req.getCustomerName()));
        mergeInfo.put("shipping_address", req.getShippingAddress());
        mergeInfo.put("shipping_name", req.getShippingName());
        mergeInfo.put("surgery_type", req.getSurgeryType());
        mergeInfo.put("days_to_surgery", req.getDaysToSurgery());

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.VSP_ORDER_DELIVERED.getTemplateKey(), req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("VSP Order Delivered email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP Order Delivered email", e);
            throw new RuntimeException("Failed to send VSP order delivered email", e);
        }
    }

    public void sendVspNewMessageEmail(VspNewMessageEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("message_sender", stringUtil.capitalizeWords(req.getMessageSender()));
        mergeInfo.put("user_email_id", req.getUserEmailId());
        mergeInfo.put("case_status", req.getCaseStatus());
        mergeInfo.put("portal_url", req.getPortalUrl());
        mergeInfo.put("patient_name", stringUtil.capitalizeWords(req.getPatientName()));

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.VSP_NEW_MESSAGE.getTemplateKey(), req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("VSP New Message email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP New Message email", e);
            throw new RuntimeException("Failed to send VSP new message email", e);
        }
    }

    public void sendVspCustomerSignedUpEmail(VspCustomerSignedUpEmailRequest req) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("signup_date", req.getSignupDate());
        mergeInfo.put("customer_email", req.getCustomerEmail());
        mergeInfo.put("customer_name", stringUtil.capitalizeWords(req.getCustomerName()));

        JSONObject emailJson = emailService.createEmailJSONObject(
                req.getEmail(), mergeInfo, EmailTemplate.VSP_CUSTOMER_SIGNEDUP.getTemplateKey(), req.getOrgName());

        try {
            emailService.sendEmail(emailJson);
            log.info("VSP Customer SignedUp email sent successfully to {}", req.getEmail());
        } catch (Exception e) {
            log.error("Error sending VSP Customer SignedUp email", e);
            throw new RuntimeException("Failed to send VSP customer signed up email", e);
        }
    }
}
