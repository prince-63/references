package com.dentalstack.chat.service;

import com.dentalstack.chat.dto.doctor.DoctorDetails;
import com.dentalstack.chat.dto.doctor.DoctorForChatService;
import com.dentalstack.chat.dto.doctor.DoctorResponse;
import org.springframework.web.bind.annotation.PathVariable;

public interface DoctorService {
    DoctorForChatService callGetDoctorForChat(Long doctorId, Long patientId);

    DoctorResponse getDoctorPatientId(Long doctorId);

    DoctorDetails getDoctor(Long doctorId);

    DoctorDetails getDoctor(String emailId);

    DoctorDetails getDoctor(String emailId, Long organizationId, String xOrgName);

    boolean isEmailVerified(@PathVariable(value = "email") String email);

    boolean findDoctorWithMobileNumberAndOrg(String doctorMobile, String orgName);
}
