package com.dentalstack.patient.feature.notification.service.mock.impl;

import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationEmailRequest;
import com.dentalstack.patient.feature.notification.dto.*;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.SmsToDoctor;
import com.dentalstack.patient.feature.notification.dto.WhatsAppRequest;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionEmailRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
@Profile(" dev ")
public class MockChatServiceImpl implements ChatService {

    @Override
    public void inviteToNonExistingPatient(SmsToDoctor smsToDoctor) {}

    @Override
    public void generateSampleChats(GenerateSampleChatRequest request) {}

    @Override
    public void sendMissedAlignerChangeSMSToDoctor(Patient patient, DoctorDetails doctor) {}

    @Override
    public void sendNotification(SendNotificationRequest sendNotificationRequest) {}

    @Override
    public void sendAlignerDetailsReceivedEmail(AlignerDetailsReceivedReq alignerDetailsReceivedReq) {}

    @Override
    public void smsForAlignerChangeAlert(SmsToDoctor smsToDoctor) {}

    @Override
    public void sendSmsToDoctorForAlignerDetailsFilledByPatient(SmsToDoctor smsToDoctor) {}

    @Override
    public void sendPatientInvitationSms(InvitationRequest request) {}

    @Override
    public void sendInvitation(InvitationRequest request) {}

    @Override
    public void deleteByPatientId(Long patientId) {}

    @Override
    public void removeFilesAndImages(RemoveFilesAndImagesRequest request) {}

    @Override
    public void emailForDraftTreatmentSaved(EmailSendForPendingReq request) {}

    @Override
    public long getDoctorUnreadMessageCount(Long doctorId, List<Long> patientIds) {
        return 0;
    }

    @Override
    public void invitationAccepted(EmailSendReq request) {}

    @Override
    public void newPatientAssignedToPractice(EmailSendReq request) {}

    @Override
    public void addedPatientByPracticeMail(EmailSendReq request) {}

    @Override
    public void newPatientAssignedToPracticeNotification(
            String orgName, String email, String displayName, Long patientId) {}

    @Override
    public void notificationForPatientAddedByPractice(String email, String displayName, Long patientId) {}

    @Override
    public void notificationForLiveActivity() {}

    @Override
    public void trialPlanExpiring(SubscriptionEmailRequest request) {}

    @Override
    public void trialPlanExpired(SubscriptionEmailRequest request) {}

    @Override
    public void subscriptionUpgraded(SubscriptionEmailRequest request) {}

    @Override
    public void subscriptionPlanExpired(SubscriptionEmailRequest request) {}

    @Override
    public void paidPlanRenewal(SubscriptionEmailRequest request) {}

    @Override
    public void topUpSuccess(SubscriptionEmailRequest request) {}

    @Override
    public void treatmentApprovedByPatient(EmailSendReq request) {}

    @Override
    public void treatmentPlanFinalizedByPractice(EmailSendReq request) {}

    @Override
    public void shippingDetailsAdded(EmailSendReq request) {}

    @Override
    public void orderSend(OrderManagementEmailRequest request) {}

    @Override
    public void requestedNeedMoreInfo(OrderManagementEmailRequest request) {}

    @Override
    public void sendTreatmentForReviewEmail(OrderManagementEmailRequest request) {}

    @Override
    public void requestToRePlan(OrderManagementEmailRequest request) {}

    @Override
    public void sendWelcomeMailToUser(WelcomeEmailRequest request) {}

    @Override
    public void requestForStlFileEmail(OrderManagementEmailRequest request) {}

    @Override
    public void stlFileUploadedEmail(OrderManagementEmailRequest request) {}

    @Override
    public void sendWhatsAppMessage(WhatsAppRequest request) {}

    @Override
    public void inviteToAllUsersExceptPractice(DoctorInvitationEmailRequest request) {}

    @Override
    public void addChatEvent(AddChatRequest request) {}
}
