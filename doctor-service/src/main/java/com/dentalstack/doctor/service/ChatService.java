package com.dentalstack.doctor.service;

import com.dentalstack.doctor.dto.mail.doctorinvitation.DoctorInvitationEmailRequest;
import com.dentalstack.doctor.dto.mail.doctorinvitation.VspCustomerInvitationEmailRequest;
import com.dentalstack.doctor.dto.mail.doctorinvitation.VspCustomerSignedUpEmailRequest;
import com.dentalstack.doctor.dto.mail.welcome.WelcomeEmailRequest;
import com.dentalstack.doctor.dto.notification.SendNotificationRequest;

public interface ChatService {

    void inviteToAllUsersExceptPractice(DoctorInvitationEmailRequest request);

    void sendVspCustomerInvitationEmail(VspCustomerInvitationEmailRequest request);

    void sendVspCustomerSignedUpEmail(VspCustomerSignedUpEmailRequest request);

    void sendWelcomeMailToUser(WelcomeEmailRequest request);

    void sendNotification(SendNotificationRequest sendNotificationRequest);
}
