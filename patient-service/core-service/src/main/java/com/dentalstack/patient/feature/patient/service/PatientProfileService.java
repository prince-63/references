package com.dentalstack.patient.feature.patient.service;

import com.dentalstack.patient.feature.invitation.dto.InvitePatientRequest;
import com.dentalstack.patient.feature.invitation.dto.v2.InvitePatientRequestV2;
import com.dentalstack.patient.feature.patient.dto.*;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.storage.files.dto.ToggleStlFileViewRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import org.springframework.web.multipart.MultipartFile;

public interface PatientProfileService {
    Patient getPatient(long id);

    PatientDetails getPatientDetails(long id);

    Patient updatePatient(UpdatePatientRequest request);

    Patient registerPatient(RegisterPatientRequest request);

    Patient registerPatientFromInvitation(Long adminProfileId, InvitePatientRequest request);

    Patient registerPatientFromInvitationV2(Long ownerProfileId, InvitePatientRequestV2 request);

    Patient registerPatientFromInvitationMobile(InvitePatientRequest request);

    Patient getPatient(String email, String mobileNo, String uuid, Long doctorId);

    Patient addPatientAddresses(Long patientId, List<AddressDetails> addresses);

    Patient updateProfilePicture(Long patientId, MultipartFile photo);

    PatientDetails updateProfilePictureAndGetDetails(Long patientId, MultipartFile photo);

    Optional<Patient> getPatientForTimeline(long id);

    PatientDetailsForDoctor getPatientForDoctor(Long id);

    PatientDetails getPatientByUUID(String uuid);

    Patient updateNewPatient(UpdateNewPatientRequest request);

    PatientResponseMobile getPatientById(Long patientId);

    List<PatientResponseMobile> getPatientsByDoctorId(Long doctorId, String status);

    void delete(Long patientId);

    void deleteByEmail(String email);

    Patient updatePatientAddress(UpdatePatientAddressRequest request);

    List<PatientResponseForCalender> getAllPatients(Long doctorId, Long profileId, Long organizationId);

    Patient updateLanguage(UpdateLanguage request);

    Patient getPatientWithEmail(String email);

    GettingStartedDetails gettingStartedDetails(Long doctorId, Long patientId);

    void gettingStartedMakeMarkAllAsRead(GettingStartedMarkAsReadRequest request);

    PatientOverviewDetails patientOverviewDetails(
            Long doctorId, Long patientId, String authorization, Long patientTaskTrackerId);

    PatientOverviewDetails patientOverviewDetails(PatientOverviewDetailsRequest request);

    PatientConnectionDetails patientConnectionDetails(String email, Long patientId, String orgName);

    void toggleStlFileView(ToggleStlFileViewRequest request);

    void toggleIsTrackingForCustomer(ToggleTrackingRequest request);

    PatientDetailsV3 getPatientDetailsV3(@Valid PatientGetRequest request);

    PlanningStepperResponse getPatientCurrentStep(@Valid PatientGetRequest request);

    Boolean getDefaultPatientFolderStatus(Long patientId);
}
