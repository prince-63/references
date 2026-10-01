package com.dentalstack.patient.feature.doctor.client;

import com.dentalstack.patient.feature.doctor.dto.AssignPracticeLocationToPatientRequest;
import com.dentalstack.patient.feature.doctor.dto.ChangePatientInvitationStatusRequest;
import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctor.dto.PLOfPatientResponse;
import com.dentalstack.patient.feature.doctor.dto.PracticeLocationDetails;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountDetails;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountRequest;
import com.dentalstack.patient.feature.invitation.dto.PatientInvitationSendRequest;
import com.dentalstack.patient.feature.sampledata.dto.GenerateSampleDoctorRequest;
import java.util.Collections;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DoctorServiceClientFallback implements DoctorServiceClient {

    private static final String FALLBACK_MSG = "DoctorServiceClient fallback triggered";

    @Override
    public DoctorDetails getDoctorDetail(Long doctorId) {
        log.warn("{}: getDoctorDetail for doctorId={}", FALLBACK_MSG, doctorId);
        return null;
    }

    @Override
    public void patientInvitationSend(PatientInvitationSendRequest request) {
        log.warn("{}: patientInvitationSend", FALLBACK_MSG);
    }

    @Override
    public void changePatientInvitationStatus(ChangePatientInvitationStatusRequest request) {
        log.warn("{}: changePatientInvitationStatus", FALLBACK_MSG);
    }

    @Override
    public Long getCountOfLocation(Long doctorId) {
        log.warn("{}: getCountOfLocation for doctorId={}", FALLBACK_MSG, doctorId);
        return 0L;
    }

    @Override
    public List<PLOfPatientResponse> getPracticeLocationOfPatient(Long doctorId) {
        log.warn("{}: getPracticeLocationOfPatient for doctorId={}", FALLBACK_MSG, doctorId);
        return Collections.emptyList();
    }

    @Override
    public List<PLOfPatientResponse> getPracticeLocationOfPatient(List<Long> patientId) {
        log.warn(
                "{}: getPracticeLocationOfPatient (batch) for {} patients",
                FALLBACK_MSG,
                patientId != null ? patientId.size() : 0);
        return Collections.emptyList();
    }

    @Override
    public List<PLOfPatientResponse> getPracticeLocationOfPatientFilter(List<Long> patientId) {
        log.warn(
                "{}: getPracticeLocationOfPatientFilter for {} patients",
                FALLBACK_MSG,
                patientId != null ? patientId.size() : 0);
        return Collections.emptyList();
    }

    @Override
    public PLOfPatientResponse getIndividualClinic(Long patientId) {
        log.warn("{}: getIndividualClinic for patientId={}", FALLBACK_MSG, patientId);
        return null;
    }

    @Override
    public String getPendingInviteDetails(Long patientId, Long doctorId) {
        log.warn("{}: getPendingInviteDetails for patientId={}, doctorId={}", FALLBACK_MSG, patientId, doctorId);
        return null;
    }

    @Override
    public DoctorDetails getSampleDoctor(GenerateSampleDoctorRequest request) {
        log.warn("{}: getSampleDoctor", FALLBACK_MSG);
        return null;
    }

    @Override
    public PracticeLocationDetails getPracticeLocation(Long patientId) {
        log.warn("{}: getPracticeLocation for patientId={}", FALLBACK_MSG, patientId);
        return null;
    }

    @Override
    public DoctorDetails doctorDetailsForPatient(Long doctorId, Long patientId) {
        log.warn("{}: doctorDetailsForPatient for doctorId={}, patientId={}", FALLBACK_MSG, doctorId, patientId);
        return null;
    }

    @Override
    public String assignPracticeLocationToPatientForApp(AssignPracticeLocationToPatientRequest request) {
        log.warn("{}: assignPracticeLocationToPatientForApp", FALLBACK_MSG);
        return null;
    }

    @Override
    public DoctorDetails getDoctorByEmail(String emailId) {
        log.warn("{}: getDoctorByEmail for email={}", FALLBACK_MSG, emailId);
        return null;
    }

    @Override
    public void removePatientPractice(Long patientId) {
        log.warn("{}: removePatientPractice for patientId={}", FALLBACK_MSG, patientId);
    }

    @Override
    public DoctorInvitationCountDetails getInvitationCountOfAllRoles(DoctorInvitationCountRequest request) {
        log.warn("{}: getInvitationCountOfAllRoles", FALLBACK_MSG);
        return null;
    }
}
