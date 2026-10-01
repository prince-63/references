package com.dentalstack.chat.service.impl;

import com.dentalstack.chat.dto.doctor.DoctorDetails;
import com.dentalstack.chat.dto.patient.PatientDetails;
import com.dentalstack.chat.service.DoctorService;
import com.dentalstack.chat.service.PatientService;
import com.dentalstack.chat.service.SchedulerService;
import com.dentalstack.chat.util.SMSSenderUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerServiceImpl implements SchedulerService {

    private final DoctorService doctorService;
    private final PatientService patientService;
    private final SMSSenderUtils smsService;

    @Value("${login_web_url}")
    private String loginWebUrl;

    @Override
    public void sendMailForUnseenChat(Long patientId, Long doctorId) throws Exception {
        PatientDetails patientDetails = patientService.getPatientDetails(patientId);
        DoctorDetails doctorDetails = doctorService.getDoctor(doctorId);

        String mobile = doctorDetails.getMobile();
        if (mobile == null) {
            log.warn("Doctor {} has no mobile number, skipping SMS for unseen chat", doctorId);
            return;
        }

        String patientName = patientDetails.getFirstName() + " " + patientDetails.getLastName();
        String messageBody = "Hello Doctor. Your patient, " + patientName.replaceAll(" ", "%20")
                + ", messaged you on Dental Stack two days ago. Login at bit.ly/3GwmLX0 to reply. Dental Stack";

        smsService.sendSmsForUnattendedChat(messageBody, mobile);
    }
}
