package com.dentalstack.chat.service.impl;

import com.dentalstack.chat.client.DoctorServiceClient;
import com.dentalstack.chat.dto.doctor.DoctorDetails;
import com.dentalstack.chat.dto.doctor.DoctorForChatService;
import com.dentalstack.chat.dto.doctor.DoctorResponse;
import com.dentalstack.chat.service.DoctorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    //    private final SomeService someService;
    private final DoctorServiceClient doctorServiceClient;

    public DoctorForChatService callGetDoctorForChat(Long doctorId, Long PatientId) {
        return doctorServiceClient.getDoctorForChat(doctorId, PatientId);
    }

    @Override
    public DoctorResponse getDoctorPatientId(Long doctorId) {
        return doctorServiceClient.getDoctorPatientId(doctorId);
    }

    @Override
    public DoctorDetails getDoctor(Long doctorId) {
        return doctorServiceClient.getDoctorDetail(doctorId);
    }

    @Override
    public DoctorDetails getDoctor(String emailId) {
        return doctorServiceClient.getDoctor(emailId);
    }

    @Override
    public DoctorDetails getDoctor(String emailId, Long organizationId, String xOrgName) {
        return doctorServiceClient.getDoctorDetails(emailId, organizationId, xOrgName);
    }

    @Override
    public boolean isEmailVerified(@PathVariable(value = "email") String email) {
        return doctorServiceClient.isEmailVerified(email);
    }

    @Override
    public boolean findDoctorWithMobileNumberAndOrg(String doctorMobile, String orgName) {
        return doctorServiceClient.findDoctorWithMobileNumberAndOrg(doctorMobile, orgName);
    }
}
