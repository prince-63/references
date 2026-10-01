package com.dentalstack.doctor.client;

import com.dentalstack.doctor.dto.mail.doctorinvitation.DoctorInvitationEmailRequest;
import com.dentalstack.doctor.dto.mail.doctorinvitation.VspCustomerInvitationEmailRequest;
import com.dentalstack.doctor.dto.mail.doctorinvitation.VspCustomerSignedUpEmailRequest;
import com.dentalstack.doctor.dto.mail.welcome.WelcomeEmailRequest;
import com.dentalstack.doctor.dto.notification.SendNotificationRequest;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "chat-service")
public interface ChatServiceClient {

    @PostMapping("/mail/vsp/v1/customer-invitation")
    String sendVspCustomerInvitationEmail(@RequestBody VspCustomerInvitationEmailRequest request);

    @PostMapping("/mail/vsp/v1/customer-signedup")
    String sendVspCustomerSignedUpEmail(@RequestBody VspCustomerSignedUpEmailRequest request);

    @PostMapping("/doctor/invitation/email/v1/invite-to-all")
    void inviteToAllUsersExceptPractice(@Valid @RequestBody DoctorInvitationEmailRequest request);

    @PostMapping("/mail/welcome")
    void sendWelcomeMailToUser(@Valid @RequestBody WelcomeEmailRequest request);

    @PostMapping("/notification/v1/send/notification")
    String sendNotification(@RequestBody SendNotificationRequest sendNotificationRequest);
}
