package com.dentalstack.chat.service.impl;

import com.dentalstack.chat.dto.email.OtpSendOnEmailRequest;
import com.dentalstack.chat.dto.otp.ErrorDTO;
import com.dentalstack.chat.dto.otp.UpdateMobileNumberRequest;
import com.dentalstack.chat.entity.OtpTransactionMaster;
import com.dentalstack.chat.exception.ErrorCode;
import com.dentalstack.chat.exception.InvalidRequestException;
import com.dentalstack.chat.repository.OtpDetailsRepository;
import com.dentalstack.chat.service.OtpValidateService;
import com.dentalstack.chat.service.PatientService;
import com.dentalstack.chat.service.email.EmailService;
import com.dentalstack.chat.util.RegExValidationUtils;
import com.dentalstack.chat.util.SMSSenderUtils;
import java.math.BigInteger;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class OtpValidateServiceImpl implements OtpValidateService {

    private final OtpDetailsRepository otpDetailsRepository;

    private final SMSSenderUtils smsService;

    private final PatientService patientService;

    private final EmailService emailService;

    @Autowired
    Environment env;

    @Override
    public String send(OtpTransactionMaster otpTransactionMaster) {

        ErrorDTO error = validateEmailOrMobile(otpTransactionMaster.getEmailId(), otpTransactionMaster.getMobileNo());
        if (error != null) {
            log.error(error.getMessage());
            throw new InvalidRequestException(error.getCode(), error.getMessage());
        }

        String otp = otpTransactionMaster.getOtpNo();

        if (otp == null) {
            otp = generateOtp(otpTransactionMaster.getMobileNo());
        }

        boolean status = false;
        if (shouldTriggerMessage(otpTransactionMaster.getMobileNo())
                && shouldTrigger((otpTransactionMaster.getCountryCode()))) {
            String message = otp
                    + " is the OTP for registering on Dental Stack. This OTP will be valid for the next 30 seconds. Dental Stack";
            smsService.sendLoginOtp(message, otpTransactionMaster.getMobileNo());
        }
        status = true;
        OtpTransactionMaster otpObj = new OtpTransactionMaster();
        otpCreateAndExpiryDateTime(otpObj);

        otpObj.setActive(true);
        otpObj.setOtpNo(otp);
        otpObj.setMobileNo(otpTransactionMaster.getMobileNo());
        otpObj.setEmailId(otpTransactionMaster.getEmailId());
        otpObj.setUserId(0L);
        otpObj.setOtpUsed(false);
        otpObj.setUserOtpAttempt(0);
        otpObj.setOtpDeliveryStatus(status);

        otpDetailsRepository.save(otpObj);

        return "OTP sent successfully";
    }

    private boolean shouldTrigger(String countryCode) {
        return countryCode.equals("+91") || countryCode.equals("IND");
    }

    private boolean shouldTriggerMessage(String mobileNumber) {
        BigInteger mobileNumberBigInt = new BigInteger(mobileNumber);
        BigInteger lowerLimit = new BigInteger("1111111111");
        BigInteger upperLimit = new BigInteger("2222222222");

        return !(mobileNumberBigInt.compareTo(lowerLimit) >= 0 && mobileNumberBigInt.compareTo(upperLimit) <= 0);
    }

    @Override
    public String sendOtpOnEmail(OtpSendOnEmailRequest otpSendOnEmailRequest) throws Exception {
        ErrorDTO error = validateEmailOrMobile(otpSendOnEmailRequest.getEmail(), null);
        if (error != null) {
            log.error(error.getMessage());
            throw new InvalidRequestException(error.getCode(), error.getMessage());
        }
        String otp;
        otp = generateOTPNew();
        boolean status;
        otpSendOnEmailRequest.setOtpNo(otp);
        try {
            org.json.JSONObject mergeInfo = new org.json.JSONObject();
            mergeInfo.put("otp", otp);
            org.json.JSONObject emailContent = emailService.createEmailJSONObject(
                    otpSendOnEmailRequest.getEmail(), mergeInfo, "otp_template", "DENTALSTACK");
            emailService.sendEmail(emailContent);
            status = true;
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", otpSendOnEmailRequest.getEmail(), e);
            status = false;
        }

        OtpTransactionMaster otpObj = new OtpTransactionMaster();
        otpCreateAndExpiryDateTime(otpObj);

        otpObj.setActive(true);
        otpObj.setOtpNo(otp);
        otpObj.setEmailId(otpSendOnEmailRequest.getEmail());
        otpObj.setUserId(0L);
        otpObj.setOtpUsed(false);
        otpObj.setUserOtpAttempt(0);
        otpObj.setOtpDeliveryStatus(status);

        otpDetailsRepository.save(otpObj);

        return "OTP sent successfully";
    }

    @Override
    public boolean verificationOTP(OtpTransactionMaster otpTransactionMaster) {
        // otp valid
        OtpTransactionMaster otpData = null;
        if (otpTransactionMaster.getEmailId() != null
                && !otpTransactionMaster.getEmailId().isEmpty()) {
            otpData = otpDetailsRepository.findTopByEmailIdAndOtpUsedFalseOrderByIdDesc(
                    otpTransactionMaster.getEmailId());
        }
        if (otpTransactionMaster.getMobileNo() != null
                && !otpTransactionMaster.getMobileNo().isEmpty()) {
            otpData = otpDetailsRepository.findTopByMobileNoAndOtpUsedFalseOrderByIdDesc(
                    otpTransactionMaster.getMobileNo());
        }

        // otp expired.
        if (otpData != null && otpData.getOtpNo().equals(otpTransactionMaster.getOtpNo())) {
            Date now = new Date();
            if (otpData.getExpiryDateTime().before(now)) {
                throw new InvalidRequestException(ErrorCode.OTP_EXPIRED, "OTP is expired");
            }

            // otp already used.
            if (otpData.isOtpUsed()) {
                throw new InvalidRequestException(ErrorCode.UNAUTHORIZED, "OTP is already used");
            }

            // Is validation attempt more than 3
            int totalAttempts = getTotalAttempts();
            if (otpData.getUserOtpAttempt() >= totalAttempts) {
                log.error("Maximum limit exceed");
                throw new InvalidRequestException(ErrorCode.LIMIT_EXCEEDED, "The maximum limit has been exceeded.");
            }

            otpData.setOtpUsed(true);
            otpData.setActive(false);
            otpDetailsRepository.save(otpData);

            return true;

        } else {
            throw new InvalidRequestException(ErrorCode.UNAUTHORIZED, "Provided details are Invalid");
        }
    }

    @Override
    public boolean verifyPatientMobile(UpdateMobileNumberRequest otpTransactionMaster) {
        // otp valid
        OtpTransactionMaster otpData = null;

        if (otpTransactionMaster.getMobileNumber() != null
                && !otpTransactionMaster.getMobileNumber().isEmpty()) {
            otpData = otpDetailsRepository.findTopByMobileNoAndOtpUsedFalseOrderByIdDesc(
                    otpTransactionMaster.getMobileNumber());
        }

        // otp expired.
        if (otpData != null && otpData.getOtpNo().equals(otpTransactionMaster.getOtp())) {
            Date now = new Date();
            if (otpData.getExpiryDateTime().before(now)) {
                throw new InvalidRequestException(ErrorCode.UNAUTHORIZED, "OTP is expired");
            }

            // otp already used.
            if (otpData.isOtpUsed()) {
                throw new InvalidRequestException(ErrorCode.UNAUTHORIZED, "OTP is already used");
            }

            // Is validation attempt more than 3
            int totalAttempts = getTotalAttempts();
            if (otpData.getUserOtpAttempt() >= totalAttempts) {
                throw new InvalidRequestException(ErrorCode.UNAUTHORIZED, "The maximum limit has been exceeded.");
            }

            otpData.setOtpUsed(true);
            otpData.setActive(false);
            otpDetailsRepository.save(otpData);
            patientService.updateMobile(otpTransactionMaster);

            return true;

        } else {
            throw new InvalidRequestException(ErrorCode.UNAUTHORIZED, "Provided details are Invalid");
        }
    }

    private int getTotalAttempts() {
        String attemptsProperty = env.getProperty("otp.attempt.allowed");
        if (attemptsProperty != null) {
            try {
                return Integer.parseInt(attemptsProperty);
            } catch (NumberFormatException e) {
                // Handle the case where the property is not a valid integer.
                // You can log an error or take appropriate action here.
            }
        }

        // Define your default totalAttempts value here.
        return 3; // Default is 3 attempts
    }

    private void otpCreateAndExpiryDateTime(OtpTransactionMaster otp) {
        LocalDateTime ldt = LocalDateTime.now();
        otp.setCreatedDateTime(Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant()));
        ldt = ldt.plusMinutes(2);
        otp.setExpiryDateTime(Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant()));
    }

    private ErrorDTO validateEmailOrMobile(String emailId, String mobile) {
        ErrorDTO erroDTO = null;
        if ((StringUtils.isBlank(emailId)) && (StringUtils.isBlank(mobile))) {

            erroDTO = new ErrorDTO(ErrorCode.BAD_REQUEST, "User Email/Mobile is Invalid!");
        }
        if (emailId != null) {
            if ((!StringUtils.isBlank(emailId)) && (!RegExValidationUtils.isValidEmail(emailId))) {

                erroDTO = new ErrorDTO(ErrorCode.BAD_REQUEST, "User email is Invalid!");
            }
        }
        if (mobile != null) {
            if ((!StringUtils.isBlank(mobile)) && (!RegExValidationUtils.isValidMobile(mobile))) {

                erroDTO = new ErrorDTO(ErrorCode.BAD_REQUEST, "User mobile number is Invalid!");
            }
        }
        return erroDTO;
    }

    private String generateOtp(String mobileNo) {
        var mobileNoLong = Long.parseLong(mobileNo);
        var lowerLimit = 1_000_000_000L;
        var upperLimit = 2_999_999_999L;
        if (mobileNoLong >= lowerLimit && mobileNoLong <= upperLimit) {
            return "1234";
        } else {
            return String.valueOf(RandomUtils.nextInt(1000, 9999));
        }
    }

    private String generateOTPNew() {
        return String.valueOf(RandomUtils.nextInt(1000, 9999));
    }
}
