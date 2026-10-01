package com.dentalstack.chat.controller.v1.email.subscription;

import com.dentalstack.chat.dto.email.EmailSendReq;
import com.dentalstack.chat.dto.email.TreatmentCompletedEmailForOrgReq;
import com.dentalstack.chat.enums.template.EmailTemplate;
import com.dentalstack.chat.service.email.EmailService;
import com.dentalstack.chat.util.ChatUtil;
import jakarta.validation.Valid;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/treatment/email/v1")
@RequiredArgsConstructor
@Slf4j
public class TreatmentEmailController {
    private final EmailService emailService;

    @PostMapping("/approved-by-patient")
    public void treatmentApprovedByPatient(@Valid @RequestBody EmailSendReq request) throws Exception {
        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("patient_name", request.getPatientName());
        mergeInfo.put("treatment_plan_name", request.getTreatmentPlanName());
        mergeInfo.put("treatment_plan_id", request.getTreatmentPlanId());
        mergeInfo.put("total_aligners", request.getTotalAligners());
        mergeInfo.put("upper_jaw_series", request.getUpperJawSeries());
        mergeInfo.put("lower_jaw_series", request.getLowerJawSeries());
        String templateKey = "2518b.3f749558a9598172.k1.81c07fc0-1c60-11f0-afd7-ae9c7e0b6a9f.196494739bc";

        JSONObject object =
                emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, request.getOrgName());

        emailService.sendEmail(object);
    }

    @PostMapping("/plan-finalized-by-practice")
    public void treatmentPlanFinalizedByPractice(@Valid @RequestBody EmailSendReq request) throws Exception {
        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("patient_name", request.getPatientName());
        mergeInfo.put("treatment_plan_name", request.getTreatmentPlanName());
        mergeInfo.put("treatment_plan_id", request.getTreatmentPlanId());
        mergeInfo.put("total_aligners", request.getTotalAligners());
        mergeInfo.put("upper_jaw_series", request.getUpperJawSeries());
        mergeInfo.put("lower_jaw_series", request.getLowerJawSeries());
        mergeInfo.put("order_id", request.getOrderId());
        mergeInfo.put("practice_name", request.getPracticeName());
        mergeInfo.put("order_receiver_email", request.getOrderReceiverEmail());

        String templateKey = "2518b.3f749558a9598172.k1.bc968c50-5aec-11f0-b5c3-ae9c7e0b6a9f.197e330f995";

        JSONObject object =
                emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, request.getOrgName());

        emailService.sendEmail(object);
    }

    @PostMapping("/shipping-details-added")
    public void shippingDetailsAdded(@Valid @RequestBody EmailSendReq request) throws Exception {
        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("patient_first_name", request.getPatientName());
        mergeInfo.put("order_id", request.getOrderId());
        mergeInfo.put("order_sender", request.getPracticeName());
        mergeInfo.put("order_sender_email", request.getOrderSenderEmail());
        mergeInfo.put("tentative_delivery_date", ChatUtil.formatDateWithSuffix(request.getTentativeDeliveryDate()));
        mergeInfo.put("tracking_link", request.getTrackingLink());
        mergeInfo.put("tracking_number", request.getTrackingNumber());

        String templateKey = "2518b.3f749558a9598172.k1.00296890-5af0-11f0-b5c3-ae9c7e0b6a9f.197e3465d99";

        JSONObject object = emailService.createEmailJSONObject(
                request.getOrderSenderEmail(), mergeInfo, templateKey, request.getOrgName());

        emailService.sendEmail(object);
    }

    @PostMapping("/treatment/completed/org")
    public void sendTreatmentCompletedEmailToOrg(@RequestBody TreatmentCompletedEmailForOrgReq request)
            throws Exception {
        JSONObject mergeInfo = new JSONObject();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        String formattedDate = request.getCompletionDate().format(formatter);
        mergeInfo.put("patient_name", request.getPatientName());
        mergeInfo.put("user_name", request.getPracticeName());
        mergeInfo.put("treatment_plan_name", request.getTreatmentPlanName());
        mergeInfo.put("treatment_completion_date", formattedDate);
        mergeInfo.put("order_id", request.getOrderId());

        JSONObject object = emailService.createEmailJSONObject(
                request.getOrgEmail(),
                mergeInfo,
                EmailTemplate.TREATMENT_COMPLETED_FOR_ORG.getTemplateKey(),
                request.getOrgName());

        emailService.sendEmail(object);
    }
}
