package com.dentalstack.chat.controller.v1;

import com.dentalstack.chat.dto.email.InvitationRequest;
import com.dentalstack.chat.dto.email.OtpSendOnEmailRequest;
import com.dentalstack.chat.dto.otp.OTPDetailsDTO;
import com.dentalstack.chat.dto.otp.UpdateMobileNumberRequest;
import com.dentalstack.chat.dto.responsebuilder.ResponseBuilder;
import com.dentalstack.chat.dto.responsebuilder.SuccessCode;
import com.dentalstack.chat.dto.sms.SmsToDoctor;
import com.dentalstack.chat.entity.OtpTransactionMaster;
import com.dentalstack.chat.exception.ErrorCode;
import com.dentalstack.chat.exception.StatusEnum;
import com.dentalstack.chat.service.AuthService;
import com.dentalstack.chat.service.DoctorService;
import com.dentalstack.chat.service.OtpValidateService;
import com.dentalstack.chat.util.SMSSenderUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "SMS api", description = "SMS add, seen and get apis")
@RestController
@RequiredArgsConstructor
@RequestMapping("/sms/v1/")
@Slf4j
public class SmsController {

    private final SMSSenderUtils smsService;

    private final OtpValidateService otpValidateService;

    @Value("${web-url}")
    private String webUrl;

    @Value("${login_web_url}")
    private String loginWebUrl;

    @Value("${android_app_url}")
    private String androidAppUrl;

    @Value("${patient_request_accept_url}")
    private String patientRequestAcceptUrl;

    @Value("${ios_app_url}")
    private String iosAppUrl;

    private final AuthService authService;

    private final DoctorService doctorService;

    @PostMapping("/otp/send")
    public String otpSend(@Valid @RequestBody OTPDetailsDTO oTPDetailsDTO) {
        OtpTransactionMaster master = new OtpTransactionMaster();
        master.setMobileNo(oTPDetailsDTO.getMobileNumber());
        if (oTPDetailsDTO.getOtpNo() == null || oTPDetailsDTO.getOtpNo().equalsIgnoreCase("")) {
            master.setOtpNo(null);
            master.setCountryCode(oTPDetailsDTO.getCountryCode());
        } else {
            master.setOtpNo(oTPDetailsDTO.getOtpNo());
            master.setCountryCode(oTPDetailsDTO.getCountryCode());
        }
        return otpValidateService.send(master);
    }

    @PostMapping("/otp/send/on-email/for/sign-up")
    public String otpSendOnEmailForSignUp(@Valid @RequestBody OtpSendOnEmailRequest otpSendOnEmailRequest)
            throws Exception {
        return otpValidateService.sendOtpOnEmail(otpSendOnEmailRequest);
    }

    private boolean shouldTriggerMessage(String mobileNumber) {
        var mobileNoLong = Long.parseLong(mobileNumber);
        var lowerLimit = 1_000_000_000L;
        var upperLimit = 2_999_999_999L;

        return !(mobileNoLong >= lowerLimit && mobileNoLong <= upperLimit);
    }

    private boolean shouldTrigger(String countryCode) {
        return countryCode.equals("+91") || countryCode.equals("IND");
    }

    @PostMapping("/otp/verification")
    public ResponseEntity<?> otpVerification(@Valid @RequestBody OTPDetailsDTO oTPDetailsDTO) {

        OtpTransactionMaster master = new OtpTransactionMaster();
        master.setEmailId(oTPDetailsDTO.getEmailId());
        master.setMobileNo(oTPDetailsDTO.getMobileNumber());
        master.setOtpNo(oTPDetailsDTO.getOtpNo());

        boolean response = otpValidateService.verificationOTP(master);
        if (response) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.SUCCESS.getValue(),
                                    SuccessCode.OK.getCode(),
                                    "OTP verified successfully")
                            .result(true)
                            .build());
        } else {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.FAILURE.getValue(),
                                    ErrorCode.BAD_REQUEST.getCode(),
                                    "OTP verification failed. Something went wrong in request data")
                            .build());
        }
    }

    @PostMapping("/otp/verification-for-email")
    public boolean otpVerificationForDoctorEmail(@Valid @RequestBody OTPDetailsDTO oTPDetailsDTO) {

        OtpTransactionMaster master = new OtpTransactionMaster();
        master.setEmailId(oTPDetailsDTO.getEmailId());
        master.setMobileNo(oTPDetailsDTO.getMobileNumber());
        master.setOtpNo(oTPDetailsDTO.getOtpNo());

        return otpValidateService.verificationOTP(master);
    }

    @PostMapping("/patient/otp/verification")
    public boolean patientOtpVerification(@Valid @RequestBody UpdateMobileNumberRequest oTPDetailsDTO) {

        OtpTransactionMaster master = new OtpTransactionMaster();
        master.setMobileNo(oTPDetailsDTO.getMobileNumber());
        master.setOtpNo(oTPDetailsDTO.getOtp());

        return otpValidateService.verifyPatientMobile(oTPDetailsDTO);
    }

    @PostMapping("/to/existing/doctor")
    public Boolean inviteToExistingDoctor(@RequestBody @Valid SmsToDoctor smsToDoctor) {

        patientRequestAcceptUrl = patientRequestAcceptUrl.replaceAll(" ", "%20");

        Boolean flag = null;
        if (smsToDoctor.getMobile() != null) {
            String patientName = "";
            patientName = smsToDoctor.getPatientName().replaceAll(" ", "%20");
            if (shouldTriggerMessage(smsToDoctor.getMobile()) && shouldTrigger(smsToDoctor.getCountryCode())) {
                String messageBody = "Hello Doctor, "
                        + patientName
                        + " has sent you an invitation to connect on Dental Stack, to track their aligner treatment. Dental Stack";
                flag = smsService.inviteByPatientToExistingDoctor(messageBody, smsToDoctor.getMobile());
            }
        }
        return flag;
    }

    @PostMapping("/send-invitation-approved-sms-to-doctor")
    public Boolean sendInvitationApprovedSMSToPatient(@RequestBody @Valid SmsToDoctor smsToDoctor) {

        patientRequestAcceptUrl = patientRequestAcceptUrl.replaceAll(" ", "%20");

        Boolean flag = null;
        if (smsToDoctor.getMobile() != null) {
            String patientName = "";
            patientName = smsToDoctor.getPatientName().replaceAll(" ", "%20");
            if (shouldTriggerMessage(smsToDoctor.getMobile()) && shouldTrigger(smsToDoctor.getCountryCode())) {
                String messageBody = "Hello Doctor. Your patient, "
                        + patientName
                        + ", has joined Dental Stack! Login at bit.ly/3GwmLX0 to view details. Let's start tracking! Dental Stack";

                flag = smsService.sendInvitationApprovedSMSToPatient(messageBody, smsToDoctor.getMobile());
            }
        }
        return flag;
    }

    // new
    @PostMapping("/to/non/existing/doctor")
    public Boolean inviteToNonExistingDoctor(@RequestBody @Valid SmsToDoctor smsToDoctor) {

        webUrl = webUrl.replaceAll(" ", "%20");

        Boolean flag = null;
        if (smsToDoctor.getMobile() != null) {

            String patientName = "";
            patientName = smsToDoctor.getPatientName().replaceAll(" ", "%20");

            if (shouldTriggerMessage(smsToDoctor.getMobile()) && shouldTrigger(smsToDoctor.getCountryCode())) {
                String messageBody = "Hello Doctor, "
                        + patientName
                        + " has invited you to sign up on Dental Stack to track their aligner treatment. Sign up on: bit.ly/3RvA6VU - Dental Stack";
                flag = smsService.inviteByPatientToNonExistingDoctor(messageBody, smsToDoctor.getMobile());
            }
        }
        return flag;
    }

    @PostMapping("/to/new/sign/up/doctor")
    public Boolean smsToNewSignUpDoctor(@RequestBody @Valid SmsToDoctor smsToDoctor) {

        webUrl = webUrl.replaceAll(" ", "%20");
        final String doctorName = smsToDoctor.getDoctorName().replaceAll(" ", "%20");
        Boolean flag = null;
        if (smsToDoctor.getMobile() != null) {

            if (shouldTriggerMessage(smsToDoctor.getMobile()) && shouldTrigger(smsToDoctor.getCountryCode())) {
                String messageBody = "Hi%20Dr%20"
                        + doctorName
                        + ".%20Welcome%20to%20the%20Dental%20Stack%20family!%20Thank%20you%20for%20creating%20an%20account%20with%20us.%20You%20can%20access%20it%20here%20"
                        + webUrl
                        + "%20-ARDENTOUS%20TECHNOLOGIES";
                flag = smsService.welcomeSmsToDoctor(messageBody, smsToDoctor.getMobile());
            }
        }
        return flag;
    }

    // new
    @PostMapping("/to/non/existing/patient")
    public Boolean inviteToNonExistingPatient(@RequestBody @Valid SmsToDoctor smsToDoctor) {
        return null;
    }

    @PostMapping("/to/doctor/of/aligner-missed-patient")
    public Boolean sendSmsForAlignerMissedPatientToDoctor(@RequestBody @Valid SmsToDoctor smsToDoctor) {

        androidAppUrl = androidAppUrl.replaceAll(" ", "%20");
        iosAppUrl = iosAppUrl.replaceAll(" ", "%20");

        Boolean flag = null;
        if (smsToDoctor.getMobile() != null) {
            String patientName;
            patientName = smsToDoctor.getPatientName().replaceAll(" ", "%20");

            if (shouldTriggerMessage(smsToDoctor.getMobile()) && shouldTrigger(smsToDoctor.getCountryCode())) {
                String messageBody = "Hello Doctor. Your patient, "
                        + patientName
                        + ", missed an Aligner Change yesterday. Login at bit.ly/3GwmLX0 to review the treatment. Dental Stack";

                flag = smsService.sendSmsForAlignerMissedPatientToDoctor(messageBody, smsToDoctor.getMobile());
            }
        }
        return flag;
    }

    @PostMapping("/to/doctor/aligner-change-alert")
    public Boolean smsForAlignerChangeAlert(@RequestBody @Valid SmsToDoctor smsToDoctor) {

        androidAppUrl = androidAppUrl.replaceAll(" ", "%20");
        iosAppUrl = iosAppUrl.replaceAll(" ", "%20");

        Boolean flag = null;
        if (smsToDoctor.getMobile() != null) {
            String patientName;
            patientName = smsToDoctor.getPatientName().replaceAll(" ", "%20");

            if (shouldTriggerMessage(smsToDoctor.getMobile()) && shouldTrigger(smsToDoctor.getCountryCode())) {
                String messageBody = "Hello Doctor. Your patient, "
                        + patientName
                        + ", has moved to the next Aligner. Login at bit.ly/3GwmLX0 to review. Dental Stack";
                flag = smsService.smsForAlignerChangeAlert(messageBody, smsToDoctor.getMobile());
            }
        }
        return flag;
    }

    @PostMapping("/to/doctor/aligner-details-filled-by-patient")
    public Boolean sendSmsToDoctorForAlignerDetailsFilledByPatient(@RequestBody @Valid SmsToDoctor smsToDoctor) {

        androidAppUrl = androidAppUrl.replaceAll(" ", "%20");
        iosAppUrl = iosAppUrl.replaceAll(" ", "%20");

        Boolean flag = null;
        if (smsToDoctor.getMobile() != null) {
            String patientName;
            patientName = smsToDoctor.getPatientName().replaceAll(" ", "%20");

            if (shouldTriggerMessage(smsToDoctor.getMobile()) && shouldTrigger(smsToDoctor.getCountryCode())) {
                String messageBody = "Hello Doctor. Your patient, "
                        + patientName
                        + ", has submitted the details. Login at bit.ly/3GwmLX0 to review the details. Dental Stack";
                flag = smsService.sendSmsToDoctorForAlignerDetailsFilledByPatient(messageBody, smsToDoctor.getMobile());
            }
        }
        return flag;
    }

    @PostMapping("/to/doctor/unattended-chat")
    public Boolean sendSmsForUnattendedChat(@RequestBody @Valid SmsToDoctor smsToDoctor) {

        loginWebUrl = loginWebUrl.replaceAll(" ", "%20");

        Boolean flag = null;
        if (smsToDoctor.getMobile() != null) {
            String patientName;
            patientName = smsToDoctor.getPatientName().replaceAll(" ", "%20");
            if (shouldTriggerMessage(smsToDoctor.getMobile()) && shouldTrigger(smsToDoctor.getCountryCode())) {
                String messageBody = "Hello Doctor. Your patient, "
                        + patientName
                        + ", messaged you on Dental Stack two days ago. Login at bit.ly/3GwmLX0 to reply. Dental Stack";
                flag = smsService.sendSmsForUnattendedChat(messageBody, smsToDoctor.getMobile());
            }
        }
        return flag;
    }

    @PostMapping("/patient/send-invitation")
    public void sendPatientInvitationSms(@RequestBody @Valid InvitationRequest request) {}
}
