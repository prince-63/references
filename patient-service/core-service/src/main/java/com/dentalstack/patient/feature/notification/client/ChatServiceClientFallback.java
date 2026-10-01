package com.dentalstack.patient.feature.notification.client;

import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationEmailRequest;
import com.dentalstack.patient.feature.notification.dto.*;
import com.dentalstack.patient.feature.notification.dto.planningcustomer.*;
import com.dentalstack.patient.feature.notification.dto.vsp.*;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionEmailRequest;
import com.dentalstack.patient.feature.treatment.dto.TreatmentCompletedEmailForOrgReq;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Component
public class ChatServiceClientFallback implements ChatServiceClient {

    private static final String FALLBACK_MSG = "ChatServiceClient fallback triggered";

    @Override
    public String sendVspCaseAssignedEmail(VspCaseAssignedEmailRequest request) {
        log.warn("{}: sendVspCaseAssignedEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendVspCaseSubmittedEmail(VspCaseSubmittedEmailRequest request) {
        log.warn("{}: sendVspCaseSubmittedEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendVspMoreInfoRequiredEmail(VspMoreInfoRequiredEmailRequest request) {
        log.warn("{}: sendVspMoreInfoRequiredEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendVspPlanningCompletedEmail(VspPlanningCompletedEmailRequest request) {
        log.warn("{}: sendVspPlanningCompletedEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendVspFilesUploadedEmail(VspFilesUploadedEmailRequest request) {
        log.warn("{}: sendVspFilesUploadedEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendVspPlanReadyEmail(VspPlanReadyEmailRequest request) {
        log.warn("{}: sendVspPlanReadyEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendVspPlanApprovedEmail(VspPlanApprovedEmailRequest request) {
        log.warn("{}: sendVspPlanApprovedEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendVspRevisionRequestedEmail(VspRevisionRequestedEmailRequest request) {
        log.warn("{}: sendVspRevisionRequestedEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendVspOrderShippedEmail(VspOrderShippedEmailRequest request) {
        log.warn("{}: sendVspOrderShippedEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendVspProductionOrderCreatedEmail(VspProductionOrderCreatedEmailRequest request) {
        log.warn("{}: sendVspProductionOrderCreatedEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendVspOrderDeliveredEmail(VspOrderDeliveredEmailRequest request) {
        log.warn("{}: sendVspOrderDeliveredEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendVspNewMessageEmail(VspNewMessageEmailRequest request) {
        log.warn("{}: sendVspNewMessageEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendAddPatientEmail(AddPatientEmailRequest request) {
        log.warn("{}: sendAddPatientEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendNeedMoreInfoEmail(NeedMoreInfoEmailRequest request) {
        log.warn("{}: sendNeedMoreInfoEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendPlanReadyEmail(PlanReadyEmailRequest request) {
        log.warn("{}: sendPlanReadyEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendPlanApprovedEmail(PlanApprovedEmailRequest request) {
        log.warn("{}: sendPlanApprovedEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendInRevisionEmail(InRevisionEmailRequest request) {
        log.warn("{}: sendInRevisionEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendStlFileUploadedEmail(StlFileUploadedEmailRequest request) {
        log.warn("{}: sendStlFileUploadedEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendCaseCompletedEmail(CaseCompletedEmailRequest request) {
        log.warn("{}: sendCaseCompletedEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public String sendNotification(SendNotificationRequest sendNotificationRequest) {
        log.warn("{}: sendNotification", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public Boolean inviteToNonExistingPatient(SmsToDoctor smsToDoctor) {
        log.warn("{}: inviteToNonExistingPatient", FALLBACK_MSG);
        return false;
    }

    @Override
    public void generateSampleChats(GenerateSampleChatRequest request) {
        log.warn("{}: generateSampleChats", FALLBACK_MSG);
    }

    @Override
    public void sendMissedAlignerChangeSMSToDoctor(SmsToDoctor smsToDoctor) {
        log.warn("{}: sendMissedAlignerChangeSMSToDoctor", FALLBACK_MSG);
    }

    @Override
    public String sendAlignerDetailsReceivedEmail(AlignerDetailsReceivedReq alignerDetailsReceivedReq) {
        log.warn("{}: sendAlignerDetailsReceivedEmail", FALLBACK_MSG);
        return "QUEUED_FOR_RETRY";
    }

    @Override
    public Boolean smsForAlignerChangeAlert(SmsToDoctor smsToDoctor) {
        log.warn("{}: smsForAlignerChangeAlert", FALLBACK_MSG);
        return false;
    }

    @Override
    public Boolean sendSmsToDoctorForAlignerDetailsFilledByPatient(SmsToDoctor smsToDoctor) {
        log.warn("{}: sendSmsToDoctorForAlignerDetailsFilledByPatient", FALLBACK_MSG);
        return false;
    }

    @Override
    public void sendPatientInvitationSms(InvitationRequest request) {
        log.warn("{}: sendPatientInvitationSms", FALLBACK_MSG);
    }

    @Override
    public void sendInvitation(InvitationRequest request) {
        log.warn("{}: sendInvitation", FALLBACK_MSG);
    }

    @Override
    public void deleteByPatientId(Long patientId) {
        log.warn("{}: deleteByPatientId for patientId={}", FALLBACK_MSG, patientId);
    }

    @Override
    public void removeFilesAndImages(RemoveFilesAndImagesRequest request) {
        log.warn("{}: removeFilesAndImages", FALLBACK_MSG);
    }

    @Override
    public void emailForDraftTreatmentSaved(EmailSendForPendingReq request) {
        log.warn("{}: emailForDraftTreatmentSaved", FALLBACK_MSG);
    }

    @Override
    public long getDoctorUnreadMessageCount(Long doctorId, List<Long> patientIds) {
        log.warn("{}: getDoctorUnreadMessageCount for doctorId={}", FALLBACK_MSG, doctorId);
        return 0L;
    }

    @Override
    public void invitationAccepted(EmailSendReq request) {
        log.warn("{}: invitationAccepted", FALLBACK_MSG);
    }

    @Override
    public void newPatientAssignedToPractice(EmailSendReq request) {
        log.warn("{}: newPatientAssignedToPractice", FALLBACK_MSG);
    }

    @Override
    public void addedPatientByPracticeMail(EmailSendReq request) {
        log.warn("{}: addedPatientByPracticeMail", FALLBACK_MSG);
    }

    @Override
    public void trialPlanExpiring(SubscriptionEmailRequest request) {
        log.warn("{}: trialPlanExpiring", FALLBACK_MSG);
    }

    @Override
    public void trialPlanExpired(SubscriptionEmailRequest request) {
        log.warn("{}: trialPlanExpired", FALLBACK_MSG);
    }

    @Override
    public void subscriptionUpgraded(SubscriptionEmailRequest request) {
        log.warn("{}: subscriptionUpgraded", FALLBACK_MSG);
    }

    @Override
    public void subscriptionPlanExpired(SubscriptionEmailRequest request) {
        log.warn("{}: subscriptionPlanExpired", FALLBACK_MSG);
    }

    @Override
    public void paidPlanRenewal(SubscriptionEmailRequest request) {
        log.warn("{}: paidPlanRenewal", FALLBACK_MSG);
    }

    @Override
    public void topUpSuccess(SubscriptionEmailRequest request) {
        log.warn("{}: topUpSuccess", FALLBACK_MSG);
    }

    @Override
    public void treatmentApprovedByPatient(EmailSendReq request) {
        log.warn("{}: treatmentApprovedByPatient", FALLBACK_MSG);
    }

    @Override
    public void treatmentPlanFinalizedByPractice(EmailSendReq request) {
        log.warn("{}: treatmentPlanFinalizedByPractice", FALLBACK_MSG);
    }

    @Override
    public void shippingDetailsAdded(EmailSendReq request) {
        log.warn("{}: shippingDetailsAdded", FALLBACK_MSG);
    }

    @Override
    public void orderSend(OrderManagementEmailRequest request) {
        log.warn("{}: orderSend", FALLBACK_MSG);
    }

    @Override
    public void requestedNeedMoreInfo(OrderManagementEmailRequest request) {
        log.warn("{}: requestedNeedMoreInfo", FALLBACK_MSG);
    }

    @Override
    public void sendTreatmentForReviewEmail(OrderManagementEmailRequest request) {
        log.warn("{}: sendTreatmentForReviewEmail", FALLBACK_MSG);
    }

    @Override
    public void requestToUpdatePlan(OrderManagementEmailRequest request) {
        log.warn("{}: requestToUpdatePlan", FALLBACK_MSG);
    }

    @Override
    public void sendWelcomeMailToUser(WelcomeEmailRequest request) {
        log.warn("{}: sendWelcomeMailToUser", FALLBACK_MSG);
    }

    @Override
    public void requestForStlFileEmail(OrderManagementEmailRequest request) {
        log.warn("{}: requestForStlFileEmail", FALLBACK_MSG);
    }

    @Override
    public void stlFileUploadedEmail(OrderManagementEmailRequest request) {
        log.warn("{}: stlFileUploadedEmail", FALLBACK_MSG);
    }

    @Override
    public void sendWhatsAppMessage(WhatsAppRequest request) {
        log.warn("{}: sendWhatsAppMessage", FALLBACK_MSG);
    }

    @Override
    public void inviteToAllUsersExceptPractice(DoctorInvitationEmailRequest request) {
        log.warn("{}: inviteToAllUsersExceptPractice", FALLBACK_MSG);
    }

    @Override
    public void sendTreatmentCompletedEmailToOrg(TreatmentCompletedEmailForOrgReq request) {
        log.warn("{}: sendTreatmentCompletedEmailToOrg", FALLBACK_MSG);
    }

    @Override
    public void sendConsentAcceptEmail(String details, MultipartFile file) {
        log.warn("{}: sendConsentAcceptEmail", FALLBACK_MSG);
    }

    @Override
    public void sendConsentCopyToAdmin(String details, MultipartFile file) {
        log.warn("{}: sendConsentCopyToAdmin", FALLBACK_MSG);
    }

    @Override
    public void addChatEvent(AddChatRequest createChatAddRequest) {
        log.warn("{}: addChatEvent", FALLBACK_MSG);
    }
}
