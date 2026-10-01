package com.dentalstack.chat.util;

import com.dentalstack.chat.exception.ErrorCode;
import com.dentalstack.chat.exception.ResourceNotFoundException;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class SMSSenderUtils {

    @Value("${sms.api.base-url:https://smsozone.com/api/mt/SendSMS}")
    private String smsApiBaseUrl;

    @Value("${sms.api.user:ardentous}")
    private String smsApiUser;

    @Value("${sms.api.password:ardentous@7654321}")
    private String smsApiPassword;

    @Value("${sms.api.sender-id:DTLSTK}")
    private String smsSenderId;

    @Value("${sms.api.peid:1301167843814020606}")
    private String smsPeid;

    // DLT Template IDs
    private static final String TEMPLATE_LOGIN_OTP = "1307170774195557478";
    private static final String TEMPLATE_INVITE_EXISTING_DOCTOR = "1307170774211885574";
    private static final String TEMPLATE_INVITE_NON_EXISTING_DOCTOR = "1307170774203004109";
    private static final String TEMPLATE_WELCOME_DOCTOR = "1307169893144586201";
    private static final String TEMPLATE_INVITE_NON_EXISTING_PATIENT = "1307170774218688620";
    private static final String TEMPLATE_ALIGNER_MISSED = "1307170774181168157";
    private static final String TEMPLATE_ALIGNER_CHANGE = "1307170774123292517";
    private static final String TEMPLATE_ALIGNER_DETAILS_FILLED = "1307170774174100142";
    private static final String TEMPLATE_INVITATION_APPROVED = "1307170774190331141";
    private static final String TEMPLATE_UNATTENDED_CHAT = "1307170774521924432";
    private static final String TEMPLATE_PATIENT_INVITE = "1307171172525995199";

    /**
     * Core SMS sending method. All public methods delegate to this.
     */
    private boolean sendSms(String messageBody, String mobile, String templateId, String logContext) {
        try {
            String urlParameters = String.format(
                    "%s?user=%s&password=%s&senderid=%s&channel=Trans&DCS=0&flashsms=0&number=%s&text=%s&route=2069&PEID=%s&DLTTemplateId=%s",
                    smsApiBaseUrl,
                    URLEncoder.encode(smsApiUser, StandardCharsets.UTF_8),
                    URLEncoder.encode(smsApiPassword, StandardCharsets.UTF_8),
                    smsSenderId,
                    mobile,
                    URLEncoder.encode(messageBody, StandardCharsets.UTF_8),
                    smsPeid,
                    templateId);

            URL url = new URL(urlParameters);
            HttpURLConnection urlConn = (HttpURLConnection) url.openConnection();
            urlConn.setConnectTimeout(5000);
            urlConn.setReadTimeout(10000);

            int responseCode;
            try (InputStream isr = urlConn.getInputStream();
                    BufferedReader in = new BufferedReader(new InputStreamReader(isr))) {
                StringBuilder response = new StringBuilder();
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                responseCode = urlConn.getResponseCode();
            }

            if (responseCode == 200) {
                log.info("{} - SMS sent successfully to {}", logContext, mobile);
                return true;
            }

            log.warn("{} - SMS API returned non-200 status: {} for mobile {}", logContext, responseCode, mobile);
            return false;

        } catch (Exception e) {
            log.error("{} - Error sending SMS to {}", logContext, mobile, e);
            throw new ResourceNotFoundException(
                    ErrorCode.INTERNAL_SERVER_ERROR, "Something went wrong please try again later");
        }
    }

    public boolean sendLoginOtp(String messageBody, String mobile) {
        return sendSms(messageBody, mobile, TEMPLATE_LOGIN_OTP, "LoginOTP");
    }

    public boolean inviteByPatientToExistingDoctor(String messageBody, String mobile) {
        return sendSms(messageBody, mobile, TEMPLATE_INVITE_EXISTING_DOCTOR, "InviteExistingDoctor");
    }

    public boolean inviteByPatientToNonExistingDoctor(String messageBody, String mobile) {
        return sendSms(messageBody, mobile, TEMPLATE_INVITE_NON_EXISTING_DOCTOR, "InviteNonExistingDoctor");
    }

    public Boolean welcomeSmsToDoctor(String messageBody, String mobile) {
        return sendSms(messageBody, mobile, TEMPLATE_WELCOME_DOCTOR, "WelcomeDoctor");
    }

    public Boolean inviteByDoctorToNonExistingPatient(String messageBody, String mobile) {
        return sendSms(messageBody, mobile, TEMPLATE_INVITE_NON_EXISTING_PATIENT, "InviteNonExistingPatient");
    }

    public Boolean sendSmsForAlignerMissedPatientToDoctor(String messageBody, String mobile) {
        return sendSms(messageBody, mobile, TEMPLATE_ALIGNER_MISSED, "AlignerMissed");
    }

    public Boolean smsForAlignerChangeAlert(String messageBody, String mobile) {
        return sendSms(messageBody, mobile, TEMPLATE_ALIGNER_CHANGE, "AlignerChange");
    }

    public Boolean sendSmsToDoctorForAlignerDetailsFilledByPatient(String messageBody, String mobile) {
        return sendSms(messageBody, mobile, TEMPLATE_ALIGNER_DETAILS_FILLED, "AlignerDetailsFilled");
    }

    public Boolean sendInvitationApprovedSMSToPatient(String messageBody, String mobile) {
        return sendSms(messageBody, mobile, TEMPLATE_INVITATION_APPROVED, "InvitationApproved");
    }

    public Boolean sendSmsForUnattendedChat(String messageBody, String mobile) {
        return sendSms(messageBody, mobile, TEMPLATE_UNATTENDED_CHAT, "UnattendedChat");
    }

    public void sendSmsForPatientInvite(String messageBody, String mobile) {
        sendSms(messageBody, mobile, TEMPLATE_PATIENT_INVITE, "PatientInvite");
    }
}
