package com.dentalstack.patient.feature.notification.client;

import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationEmailRequest;
import com.dentalstack.patient.feature.notification.dto.*;
import com.dentalstack.patient.feature.notification.dto.planningcustomer.*;
import com.dentalstack.patient.feature.notification.dto.vsp.*;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionEmailRequest;
import com.dentalstack.patient.feature.treatment.dto.TreatmentCompletedEmailForOrgReq;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@FeignClient(
        name = "chat-service",
        url = "${spring.cloud.openfeign.client.config.chat-service.url}",
        fallback = ChatServiceClientFallback.class)
public interface ChatServiceClient {

    @PostMapping("/mail/vsp/v1/case-assigned")
    String sendVspCaseAssignedEmail(@RequestBody VspCaseAssignedEmailRequest request);

    @PostMapping("/mail/vsp/v1/case-submitted")
    String sendVspCaseSubmittedEmail(@RequestBody VspCaseSubmittedEmailRequest request);

    @PostMapping("/mail/vsp/v1/more-info-required")
    String sendVspMoreInfoRequiredEmail(@RequestBody VspMoreInfoRequiredEmailRequest request);

    @PostMapping("/mail/vsp/v1/planning-completed")
    String sendVspPlanningCompletedEmail(@RequestBody VspPlanningCompletedEmailRequest request);

    @PostMapping("/mail/vsp/v1/files-uploaded")
    String sendVspFilesUploadedEmail(@RequestBody VspFilesUploadedEmailRequest request);

    @PostMapping("/mail/vsp/v1/plan-ready")
    String sendVspPlanReadyEmail(@RequestBody VspPlanReadyEmailRequest request);

    @PostMapping("/mail/vsp/v1/plan-approved")
    String sendVspPlanApprovedEmail(@RequestBody VspPlanApprovedEmailRequest request);

    @PostMapping("/mail/vsp/v1/revision-requested")
    String sendVspRevisionRequestedEmail(@RequestBody VspRevisionRequestedEmailRequest request);

    @PostMapping("/mail/vsp/v1/order-shipped")
    String sendVspOrderShippedEmail(@RequestBody VspOrderShippedEmailRequest request);

    @PostMapping("/mail/vsp/v1/production-order-created")
    String sendVspProductionOrderCreatedEmail(@RequestBody VspProductionOrderCreatedEmailRequest request);

    @PostMapping("/mail/vsp/v1/order-delivered")
    String sendVspOrderDeliveredEmail(@RequestBody VspOrderDeliveredEmailRequest request);

    @PostMapping("/mail/vsp/v1/new-message")
    String sendVspNewMessageEmail(@RequestBody VspNewMessageEmailRequest request);

    @PostMapping("/mail/planning/v1/add-patient")
    String sendAddPatientEmail(@RequestBody AddPatientEmailRequest request);

    @PostMapping("/mail/planning/v1/need-more-info")
    String sendNeedMoreInfoEmail(@RequestBody NeedMoreInfoEmailRequest request);

    @PostMapping("/mail/planning/v1/plan-ready")
    String sendPlanReadyEmail(@RequestBody PlanReadyEmailRequest request);

    @PostMapping("/mail/planning/v1/plan-approved")
    String sendPlanApprovedEmail(@RequestBody PlanApprovedEmailRequest request);

    @PostMapping("/mail/planning/v1/in-review")
    String sendInRevisionEmail(@RequestBody InRevisionEmailRequest request);

    @PostMapping("/mail/planning/v1/stl-file-uploaded")
    String sendStlFileUploadedEmail(@RequestBody StlFileUploadedEmailRequest request);

    @PostMapping("/mail/planning/v1/case-completed")
    String sendCaseCompletedEmail(@RequestBody CaseCompletedEmailRequest request);

    @PostMapping("/notification/v1/send/notification")
    String sendNotification(@RequestBody SendNotificationRequest sendNotificationRequest);

    @PostMapping("/sms/v1/to/non/existing/patient")
    Boolean inviteToNonExistingPatient(@RequestBody SmsToDoctor smsToDoctor);

    @PostMapping("/chat/sample/data/v1/")
    void generateSampleChats(@RequestBody GenerateSampleChatRequest request);

    @PostMapping("/sms/v1/to/doctor/of/aligner-missed-patient")
    void sendMissedAlignerChangeSMSToDoctor(@RequestBody @Valid SmsToDoctor smsToDoctor);

    @PostMapping("/mail/patient/aligner-details-received-notification")
    String sendAlignerDetailsReceivedEmail(@Valid @RequestBody AlignerDetailsReceivedReq alignerDetailsReceivedReq);

    @PostMapping("/sms/v1/to/doctor/aligner-change-alert")
    Boolean smsForAlignerChangeAlert(@RequestBody @Valid SmsToDoctor smsToDoctor);

    @PostMapping("/sms/v1/to/doctor/aligner-details-filled-by-patient")
    Boolean sendSmsToDoctorForAlignerDetailsFilledByPatient(@RequestBody @Valid SmsToDoctor smsToDoctor);

    @PostMapping("/sms/v1/patient/send-invitation")
    void sendPatientInvitationSms(@RequestBody @Valid InvitationRequest request);

    @PostMapping("/mail/patient/send-invitation")
    void sendInvitation(@Valid @RequestBody InvitationRequest request);

    @PostMapping("/chat/v1/delete/{patient_id}")
    void deleteByPatientId(@PathVariable("patient_id") Long patientId);

    @PostMapping("/chat/v1/remove-files-and-images")
    void removeFilesAndImages(@RequestBody RemoveFilesAndImagesRequest request);

    @PostMapping("/mail/draft-treatment-saved")
    void emailForDraftTreatmentSaved(@Valid @RequestBody EmailSendForPendingReq request);

    @PostMapping("/chat/v1/unread/message/count/{doctorId}")
    long getDoctorUnreadMessageCount(
            @PathVariable(value = "doctorId") Long doctorId, @RequestBody List<Long> patientIds);

    @PostMapping("/mail/invitation-accepted")
    void invitationAccepted(@Valid @RequestBody EmailSendReq request);

    @PostMapping("/mail/new-patient-assigned-to-practice")
    void newPatientAssignedToPractice(@Valid @RequestBody EmailSendReq request);

    @PostMapping("/mail/added-patient-by-practice-mail")
    void addedPatientByPracticeMail(@Valid @RequestBody EmailSendReq request);

    @PostMapping("/subscription/email/v1/trial-plan-expiring")
    void trialPlanExpiring(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/subscription/email/v1/trial-plan-expired")
    void trialPlanExpired(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/subscription/email/v1/upgrade-complete")
    void subscriptionUpgraded(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/subscription/email/v1/paid-plan-expired")
    void subscriptionPlanExpired(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/subscription/email/v1/paid-plan-renewal")
    void paidPlanRenewal(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/subscription/email/v1/top-up-success")
    void topUpSuccess(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/treatment/email/v1/approved-by-patient")
    void treatmentApprovedByPatient(@Valid @RequestBody EmailSendReq request);

    @PostMapping("/treatment/email/v1/plan-finalized-by-practice")
    void treatmentPlanFinalizedByPractice(@Valid @RequestBody EmailSendReq request);

    @PostMapping("/treatment/email/v1/shipping-details-added")
    void shippingDetailsAdded(@Valid @RequestBody EmailSendReq request);

    @PostMapping("/order/management/email/v1/send-order")
    void orderSend(@Valid @RequestBody OrderManagementEmailRequest request);

    @PostMapping("/order/management/email/v1/requested-need-more-info")
    void requestedNeedMoreInfo(@Valid @RequestBody OrderManagementEmailRequest request);

    @PostMapping("/order/management/email/v1/send-treatment-for-review")
    void sendTreatmentForReviewEmail(@Valid @RequestBody OrderManagementEmailRequest request);

    @PostMapping("/order/management/email/v1/request-for-re-plan")
    void requestToUpdatePlan(@Valid @RequestBody OrderManagementEmailRequest request);

    @PostMapping("/mail/welcome")
    void sendWelcomeMailToUser(@Valid @RequestBody WelcomeEmailRequest request);

    @PostMapping("/order/management/email/v1/request-for-stl-file")
    void requestForStlFileEmail(@Valid @RequestBody OrderManagementEmailRequest request);

    @PostMapping("/order/management/email/v1/stl-file-uploaded")
    void stlFileUploadedEmail(@Valid @RequestBody OrderManagementEmailRequest request);

    @PostMapping("/chat/whatsapp/notification/v1/send-message")
    void sendWhatsAppMessage(@RequestBody WhatsAppRequest request);

    @PostMapping("/doctor/invitation/email/v1/invite-to-all")
    void inviteToAllUsersExceptPractice(@Valid @RequestBody DoctorInvitationEmailRequest request);

    @PostMapping("/treatment/email/v1/treatment/completed/org")
    void sendTreatmentCompletedEmailToOrg(@Valid @RequestBody TreatmentCompletedEmailForOrgReq request);

    @PostMapping(
            value = "/consent/email/v1/send-to-accepter",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    void sendConsentAcceptEmail(@RequestParam("details") String details, @RequestPart("file") MultipartFile file);

    @PostMapping(
            value = "/consent/email/v1/send-copy-to-admin",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    void sendConsentCopyToAdmin(@RequestParam("details") String details, @RequestPart("file") MultipartFile file);

    @PostMapping(path = "/chat/v1/add/chat/event", consumes = MediaType.APPLICATION_JSON_VALUE)
    void addChatEvent(@RequestBody AddChatRequest createChatAddRequest);
}
