package com.dentalstack.patient.feature.invitation.service;

import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationDetails;
import com.dentalstack.patient.feature.invitation.dto.*;
import com.dentalstack.patient.feature.invitation.dto.AllInvitationDetailsForMobile;
import com.dentalstack.patient.feature.invitation.dto.ChangeInvitationStatusByPatient;
import com.dentalstack.patient.feature.invitation.dto.ChangeNewInvitationStatusByDoctorRequest;
import com.dentalstack.patient.feature.invitation.dto.PatientNewInvitationDetails;
import com.dentalstack.patient.feature.invitation.dto.v2.InvitePatientRequestV2;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public interface InvitationService {
    Invitation invitePatient(InvitePatientRequest request);

    Invitation invitePatientV2(InvitePatientRequestV2 request);

    Invitation invitePatientFromMobile(InvitePatientRequest request);

    List<AllInvitationDetails> getDoctorAllInvitation(Long doctorId);

    Invitation updateInvitation(UpdateInvitationRequest request);

    DoctorInvitationDetails getInvitationDetails(String inviteCode);

    PatientNewInvitationDetails changePatientInvitationStatusByPatient(ChangeInvitationStatusByPatient request);

    PatientDetails convertLeadToPatient(Long patientId);

    PatientNewInvitationDetails changePatientInvitationStatusByDoctor(ChangeNewInvitationStatusByDoctorRequest request);

    Invitation notifyPatient(long patientId, String doctorName);

    Invitation notifyPatient(NotifyPatientRequest request);

    DoctorDetails getDoctorDetails(Long patientId);

    DoctorDetails getDoctorDetails(String patientId);

    List<AllInvitationDetailsForMobile> getMobileLeadData(Long doctorId);

    List<AllInvitationDetailsForMobile> getMobileLeadsFromAppointments(
            Long doctorId, Boolean withoutAppointment, Boolean withoutReminder);

    ValidateInvitationResponse validationPatientInvitation(ValidateInvitationRequest validateInvitationRequest);

    void createPatientTaskTrackerThrowSignup(Long patientId, Long practiceProfileId, Long parentTaskId);

    void createPatientTaskTracker(@NotNull(message = "Profile ID is required") Long profileId, String invitationCode);
}
