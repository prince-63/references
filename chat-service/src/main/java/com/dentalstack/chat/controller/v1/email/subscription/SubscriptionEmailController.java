package com.dentalstack.chat.controller.v1.email.subscription;

import com.dentalstack.chat.dto.email.subscription.SubscriptionEmailRequest;
import com.dentalstack.chat.service.email.EmailService;
import com.dentalstack.chat.util.ChatUtil;
import com.dentalstack.chat.util.DateTimeUtils;
import jakarta.validation.Valid;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/subscription/email/v1")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionEmailController {

    private final EmailService emailService;

    @PostMapping("/trial-plan-expiring")
    public void trialPlanExpiring(@Valid @RequestBody SubscriptionEmailRequest request) throws Exception {
        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("practice_display_name", request.getPracticeDisplayName());
        mergeInfo.put("plan_name", request.getPlanName());
        mergeInfo.put("parameter1", request.getPatientOrOrder());
        mergeInfo.put("parameter1_value", request.getUserLimit());
        mergeInfo.put("storage_value", request.getStorageLimit());
        mergeInfo.put("trial_expiry_date", DateTimeUtils.formatZonedDateWithSuffix(request.getPlanEndDate()));

        String templateKey = "2518b.3f749558a9598172.k1.56b4a8c0-1c5a-11f0-afd7-ae9c7e0b6a9f.196491ecd4c";

        JSONObject object =
                emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, request.getOrgName());
        emailService.sendEmail(object);
    }

    @PostMapping("/trial-plan-expired")
    public void trialPlanExpired(@Valid @RequestBody SubscriptionEmailRequest request) throws Exception {
        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("user_name", request.getPracticeDisplayName()); // add salutation first name and last name
        String templateKey = "2518b.3f749558a9598172.k1.2b10ac40-1c5b-11f0-afd7-ae9c7e0b6a9f.19649243d04";

        JSONObject object =
                emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, request.getOrgName());
        emailService.sendEmail(object);
    }

    @PostMapping("/upgrade-complete")
    public void subscriptionUpgraded(@Valid @RequestBody SubscriptionEmailRequest request) throws Exception {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("user_name", request.getPracticeDisplayName());
        mergeInfo.put("new_plan_name", request.getPlanName());
        mergeInfo.put("plan_start_date", DateTimeUtils.formatZonedDateWithSuffix(request.getPlanStartDate()));
        mergeInfo.put("plan_end_date", DateTimeUtils.formatZonedDateWithSuffix(request.getPlanEndDate()));

        mergeInfo.put("parameter1", request.getPatientOrOrder());
        mergeInfo.put("parameter1_value", request.getUserLimit());
        mergeInfo.put("storage_limit", request.getStorageLimit());

        String templateKey = "2518b.3f749558a9598172.k1.05a67790-1c5c-11f0-afd7-ae9c7e0b6a9f.1964929d589";

        JSONObject object =
                emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, request.getOrgName());

        emailService.sendEmail(object);
    }

    @PostMapping("/paid-plan-expired")
    public void subscriptionPlanExpired(@Valid @RequestBody SubscriptionEmailRequest request) throws Exception {
        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("user_name", request.getPracticeDisplayName());
        mergeInfo.put("current_plan", request.getPracticeDisplayName());

        var formattedDate = ChatUtil.formatDateWithSuffix(LocalDate.from(request.getDate()));
        mergeInfo.put("plan_end_date", formattedDate);

        String templateKey = "2518b.3f749558a9598172.k1.7779c290-1c5d-11f0-afd7-ae9c7e0b6a9f.19649334d39";

        JSONObject object =
                emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, request.getOrgName());
        emailService.sendEmail(object);
    }

    @PostMapping("/paid-plan-renewal")
    public void paidPlanRenewal(@Valid @RequestBody SubscriptionEmailRequest request) throws Exception {
        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("user_name", request.getPracticeDisplayName());
        mergeInfo.put("current_plan", request.getPracticeDisplayName());

        var formattedDate = ChatUtil.formatDateWithSuffix(LocalDate.from(request.getDate()));
        mergeInfo.put("plan_end_date", formattedDate);

        String templateKey = "2518b.3f749558a9598172.k1.f0ebf590-1c5c-11f0-afd7-ae9c7e0b6a9f.196492fdb69";

        JSONObject object =
                emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, request.getOrgName());
        emailService.sendEmail(object);
    }

    @PostMapping("/top-up-success")
    public void topUpSuccess(@Valid @RequestBody SubscriptionEmailRequest request) throws Exception {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("user_name", request.getPracticeDisplayName());

        mergeInfo.put("request_type", request.getPlanName());

        String templateKey = "2518b.3f749558a9598172.k1.068fdb40-1c5e-11f0-afd7-ae9c7e0b6a9f.1964936f6f4";

        JSONObject object =
                emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, request.getOrgName());
        emailService.sendEmail(object);
    }
}
