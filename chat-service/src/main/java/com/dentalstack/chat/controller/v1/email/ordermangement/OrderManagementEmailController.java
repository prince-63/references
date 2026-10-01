package com.dentalstack.chat.controller.v1.email.ordermangement;

import static com.dentalstack.chat.util.ChatUtil.shouldUseSecondaryAccount;

import com.dentalstack.chat.dto.ordermanagement.OrderManagementEmailRequest;
import com.dentalstack.chat.enums.template.EmailTemplate;
import com.dentalstack.chat.service.email.EmailService;
import com.dentalstack.chat.util.ChatUtil;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/order/management/email/v1")
@RequiredArgsConstructor
@Slf4j
public class OrderManagementEmailController {
    private final EmailService emailService;

    private String formatDateWithSuffix(LocalDate date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMM yyyy");
        String formattedDate = date.format(formatter);
        int day = date.getDayOfMonth();
        String dayWithSuffix = addDaySuffix(day);

        return formattedDate.replaceFirst("\\d+", dayWithSuffix);
    }

    private String addDaySuffix(int day) {
        if (day >= 11 && day <= 13) {
            return day + "th";
        }

        return switch (day % 10) {
            case 1 -> day + "st";
            case 2 -> day + "nd";
            case 3 -> day + "rd";
            default -> day + "th";
        };
    }

    @PostMapping("/send-order")
    public void orderSend(@Valid @RequestBody OrderManagementEmailRequest request) throws Exception {
        // var formattedDate = formatDateWithSuffix(LocalDate.from(request.getDueBy()));

        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("order_sender_email", request.getOrderSenderEmail());
        mergeInfo.put("order_sender", request.getOrderSenderName());
        mergeInfo.put("patient_name", request.getPatientName());
        mergeInfo.put("order_type", request.getOrderType());
        mergeInfo.put("order_id", request.getOrderId());
        // mergeInfo.put("due_by", formattedDate);
        mergeInfo.put("order_receiver_email", request.getOrderReceiverName());

        String orgName = ChatUtil.mapOrgName(request.getOrgName());

        String templateKey = EmailTemplate.ORDER_SEND.getTemplateKey();

        boolean isSecondaryAccount = shouldUseSecondaryAccount(orgName);

        JSONObject object =
                emailService.createEmailJSONObject(request.getOrderReceiverEmail(), mergeInfo, templateKey, orgName);

        emailService.sendEmail(object, isSecondaryAccount);
    }

    @PostMapping("/send-treatment-for-review")
    public void sendTreatmentForReviewEmail(@Valid @RequestBody OrderManagementEmailRequest request) throws Exception {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("order_sender_email", request.getOrderSenderEmail());
        mergeInfo.put("patient_name", request.getPatientName());
        mergeInfo.put("order_receiver", request.getOrderReceiverName());
        mergeInfo.put("treatment_plan_name", request.getTreatmentPlanName());
        mergeInfo.put("treatment_plan_id", request.getTreatmentPlanId());
        mergeInfo.put("total_aligners", request.getTotalAligners());
        mergeInfo.put("upper_jaw_series", request.getUpperJawSeries());
        mergeInfo.put("lower_jaw_series", request.getLowerJawSeries());
        mergeInfo.put("order_id", request.getOrderId());
        mergeInfo.put("order_sender", request.getOrderSenderName());

        String orgName = ChatUtil.mapOrgName(request.getOrgName());
        String templateKey = EmailTemplate.SENT_TREATMENT_PLAN_FOR_REVIEW.getTemplateKey();

        boolean isSecondaryAccount = shouldUseSecondaryAccount(orgName);

        JSONObject object =
                emailService.createEmailJSONObject(request.getOrderReceiverEmail(), mergeInfo, templateKey, orgName);
        emailService.sendEmail(object, isSecondaryAccount);
    }

    @PostMapping("/requested-need-more-info")
    public void requestedNeedMoreInfo(@Valid @RequestBody OrderManagementEmailRequest request) throws Exception {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("order_sender_email", request.getOrderSenderEmail());
        mergeInfo.put("order_receiver", request.getOrderReceiverName());
        mergeInfo.put("patient_first_name", request.getPatientName());
        mergeInfo.put("order_sender", request.getOrderSenderName());

        mergeInfo.put("order_id", request.getOrderId());
        mergeInfo.put("org_remarks", request.getRemarks());

        String orgName = ChatUtil.mapOrgName(request.getOrgName());
        String templateKey = EmailTemplate.NEED_MORE_INFO_REQUESTED.getTemplateKey();

        JSONObject object =
                emailService.createEmailJSONObject(request.getOrderSenderEmail(), mergeInfo, templateKey, orgName);
        boolean isSecondaryAccount = shouldUseSecondaryAccount(orgName);

        emailService.sendEmail(object, isSecondaryAccount);
    }

    @PostMapping("/request-for-re-plan")
    public void requestToRePlan(@Valid @RequestBody OrderManagementEmailRequest request) throws Exception {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("order_receiver_email", request.getOrderReceiverEmail());
        mergeInfo.put("order_receiver", request.getOrderReceiverName());
        mergeInfo.put("patient_name", request.getPatientName());
        mergeInfo.put("order_sender", request.getOrderSenderName());
        mergeInfo.put("treatment_plan_name", request.getTreatmentPlanName());
        mergeInfo.put("treatment_plan_id", request.getTreatmentPlanId());
        mergeInfo.put("total_aligners", request.getTotalAligners());
        mergeInfo.put("upper_jaw_series", request.getUpperJawSeries());
        mergeInfo.put("lower_jaw_series", request.getLowerJawSeries());
        mergeInfo.put("order_id", request.getOrderId());
        mergeInfo.put("order_sender", request.getOrderSenderName());
        mergeInfo.put("replan_comments", request.getReplanComment());
        mergeInfo.put("order_sender_email", request.getOrderSenderEmail());

        String orgName = ChatUtil.mapOrgName(request.getOrgName());
        String templateKey;
        if (orgName.equalsIgnoreCase("CRAFTALIGN")) {
            templateKey = EmailTemplate.CRAFT_ALIGN_RE_PLAN_TREATMENT.getTemplateKey();
        } else {
            templateKey = EmailTemplate.RE_PLAN_TREATMENT.getTemplateKey();
        }
        JSONObject object =
                emailService.createEmailJSONObject(request.getOrderReceiverEmail(), mergeInfo, templateKey, orgName);
        boolean isSecondaryAccount = shouldUseSecondaryAccount(orgName);

        emailService.sendEmail(object, isSecondaryAccount);
    }

    @PostMapping("/request-for-stl-file")
    public void requestForStlFileEmail(@Valid @RequestBody OrderManagementEmailRequest request) throws Exception {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("order_receiver_email", request.getOrderReceiverEmail());
        mergeInfo.put("patient_name", request.getPatientName());
        mergeInfo.put("order_sender", request.getOrderSenderName());
        mergeInfo.put("order_receiver", request.getOrderReceiverName());

        mergeInfo.put(
                "treatment_plan_name",
                request.getTreatmentPlanName() != null ? request.getTreatmentPlanName() : request.getTreatmentPlanId());
        mergeInfo.put("treatment_plan_id", request.getTreatmentPlanId());
        mergeInfo.put("total_aligners", request.getTotalAligners());
        mergeInfo.put("upper_jaw_series", request.getUpperJawSeries());
        mergeInfo.put("lower_jaw_series", request.getLowerJawSeries());
        mergeInfo.put("order_id", request.getOrderId());
        mergeInfo.put("order_sender", request.getOrderSenderName());
        mergeInfo.put("comments", request.getReplanComment());
        mergeInfo.put("order_sender_email", request.getOrderSenderEmail());
        mergeInfo.put("stlfile_type", request.getStlFileType());

        String orgName = ChatUtil.mapOrgName(request.getOrgName());
        String templateKey;
        if (orgName.equalsIgnoreCase("CRAFTALIGN")) {
            templateKey = EmailTemplate.CRAFT_ALIGN_REQUEST_STL_FILES.getTemplateKey();
        } else {
            templateKey = EmailTemplate.REQUEST_STL_FILES.getTemplateKey();
        }

        JSONObject object =
                emailService.createEmailJSONObject(request.getOrderReceiverEmail(), mergeInfo, templateKey, orgName);
        boolean isSecondaryAccount = shouldUseSecondaryAccount(orgName);

        emailService.sendEmail(object, isSecondaryAccount);
    }

    @PostMapping("/stl-file-uploaded")
    public void stlFileUploadedEmail(@Valid @RequestBody OrderManagementEmailRequest request) throws Exception {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("order_receiver_email", request.getOrderReceiverEmail());
        mergeInfo.put("patient_name", request.getPatientName());
        mergeInfo.put("order_receiver", request.getOrderReceiverName());

        mergeInfo.put("order_sender", request.getOrderSenderName());
        mergeInfo.put(
                "treatment_plan_name",
                request.getTreatmentPlanName() != null ? request.getTreatmentPlanName() : request.getTreatmentPlanId());
        mergeInfo.put("treatment_plan_id", request.getTreatmentPlanId());
        mergeInfo.put("total_aligners", request.getTotalAligners());
        mergeInfo.put("upper_jaw_series", request.getUpperJawSeries());
        mergeInfo.put("lower_jaw_series", request.getLowerJawSeries());
        mergeInfo.put("order_id", request.getOrderId());
        mergeInfo.put("order_sender", request.getOrderSenderName());
        mergeInfo.put("comments", request.getReplanComment());
        mergeInfo.put("order_sender_email", request.getOrderSenderEmail());

        String orgName = ChatUtil.mapOrgName(request.getOrgName());
        String templateKey = EmailTemplate.UPLOADED_STL_FILES.getTemplateKey();

        JSONObject object =
                emailService.createEmailJSONObject(request.getOrderReceiverEmail(), mergeInfo, templateKey, orgName);

        boolean isSecondaryAccount = shouldUseSecondaryAccount(orgName);

        emailService.sendEmail(object, isSecondaryAccount);
    }

    @PostMapping("/unprocessed-due")
    public void unprocessedDue(@Valid @RequestBody UnprocessedAlignerDue request) throws Exception {
        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("patient_name", request.getPatientName());
        mergeInfo.put("due_date", request.getDueDate());
        mergeInfo.put("upper_start", request.getUpperStart());
        mergeInfo.put("upper_end", request.getUpperEnd());
        mergeInfo.put("lower_start", request.getLowerStart());
        mergeInfo.put("lower_end", request.getLowerEnd());

        String orgName = ChatUtil.mapOrgName(request.getOrgName());

        String templateKey = EmailTemplate.UNPROCESSED_ALIGNER_DUE.getTemplateKey();

        boolean isSecondaryAccount = shouldUseSecondaryAccount(orgName);

        JSONObject object = emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, orgName);

        emailService.sendEmail(object, isSecondaryAccount);
    }
}
