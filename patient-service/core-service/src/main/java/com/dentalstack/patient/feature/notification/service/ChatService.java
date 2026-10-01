package com.dentalstack.patient.feature.notification.service;

import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationEmailRequest;
import com.dentalstack.patient.feature.notification.dto.*;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.SmsToDoctor;
import com.dentalstack.patient.feature.notification.dto.WhatsAppRequest;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionEmailRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.RequestBody;

public interface ChatService {

    void inviteToNonExistingPatient(@RequestBody @Valid SmsToDoctor smsToDoctor);

    void generateSampleChats(GenerateSampleChatRequest request);

    void sendMissedAlignerChangeSMSToDoctor(Patient patient, DoctorDetails doctor);

    void sendNotification(SendNotificationRequest sendNotificationRequest);

    void sendAlignerDetailsReceivedEmail(AlignerDetailsReceivedReq alignerDetailsReceivedReq);

    void smsForAlignerChangeAlert(SmsToDoctor smsToDoctor);

    void sendSmsToDoctorForAlignerDetailsFilledByPatient(SmsToDoctor smsToDoctor);

    void sendPatientInvitationSms(InvitationRequest request);

    void sendInvitation(InvitationRequest request);

    void deleteByPatientId(Long patientId);

    void removeFilesAndImages(RemoveFilesAndImagesRequest request);

    void emailForDraftTreatmentSaved(@Valid @RequestBody EmailSendForPendingReq request);

    long getDoctorUnreadMessageCount(Long doctorId, List<Long> patientIds);

    void invitationAccepted(EmailSendReq request);

    void newPatientAssignedToPractice(@Valid @RequestBody EmailSendReq request);

    void addedPatientByPracticeMail(EmailSendReq request);

    void newPatientAssignedToPracticeNotification(String s, String email, String displayName, Long patientId);

    void notificationForPatientAddedByPractice(String email, String displayName, Long patientId);

    void notificationForLiveActivity();

    void trialPlanExpiring(@Valid @RequestBody SubscriptionEmailRequest request);

    void trialPlanExpired(SubscriptionEmailRequest request);

    void subscriptionUpgraded(SubscriptionEmailRequest request);

    void subscriptionPlanExpired(SubscriptionEmailRequest request);

    void paidPlanRenewal(SubscriptionEmailRequest request);

    void topUpSuccess(SubscriptionEmailRequest request);

    void treatmentApprovedByPatient(EmailSendReq request);

    void treatmentPlanFinalizedByPractice(EmailSendReq request);

    void shippingDetailsAdded(EmailSendReq request);

    void orderSend(OrderManagementEmailRequest request);

    void requestedNeedMoreInfo(OrderManagementEmailRequest request);

    void sendTreatmentForReviewEmail(OrderManagementEmailRequest request);

    void requestToRePlan(OrderManagementEmailRequest request);

    void sendWelcomeMailToUser(WelcomeEmailRequest request);

    void requestForStlFileEmail(OrderManagementEmailRequest request);

    void stlFileUploadedEmail(OrderManagementEmailRequest request);

    void sendWhatsAppMessage(WhatsAppRequest request);

    void inviteToAllUsersExceptPractice(DoctorInvitationEmailRequest request);

    void addChatEvent(AddChatRequest request);
}
